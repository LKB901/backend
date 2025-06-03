"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRegistryCron = startRegistryCron;
exports.sha256 = sha256;
const node_cron_1 = __importDefault(require("node-cron"));
const crypto_1 = __importDefault(require("crypto"));
const deep_diff_1 = __importDefault(require("deep-diff"));
const property_model_1 = require("../models/property.model");
const alert_model_1 = require("../models/alert.model");
const registryApi_1 = require("../utils/registryApi");
const diffClassifier_1 = require("../utils/diffClassifier");
const pdf_1 = require("../utils/pdf");
/* ─────────────────────────────────────────────
   1. 크론 잡 등록
   ─────────────────────────────────────────── */
function startRegistryCron() {
    const rule = process.env.REGISTRY_CRON ?? '* * * * *';
    console.log('[CRON] preparing registry cron on rule', rule);
    try {
        node_cron_1.default.schedule(rule, run, { timezone: 'Asia/Seoul' });
        console.log('[CRON] registry cron scheduled ✓');
    }
    catch (err) {
        console.error('[CRON] registry schedule FAILED →', err);
    }
}
/* ─────────────────────────────────────────────
   2. Tick 실행 함수
   ─────────────────────────────────────────── */
async function run() {
    console.log('[CRON] registry tick', new Date().toLocaleTimeString());
    let props;
    try {
        props = await property_model_1.Property.find();
        console.log('[CRON] props.length =', props.length);
    }
    catch (err) {
        console.error('[CRON] find() error →', err);
        return;
    }
    for (const prop of props) {
        try {
            await processProperty(prop);
        }
        catch (err) {
            console.error('[CRON] processProperty error for', prop.uniqueNo, err);
        }
    }
}
/* ─────────────────────────────────────────────
   3. 개별 Property 처리
   ─────────────────────────────────────────── */
async function processProperty(prop) {
    // 등기부 조회 (stub 포함)
    const { rawXml, parsed, hash, noChange } = (await (0, registryApi_1.fetchRegistry)(prop.uniqueNo));
    // ① 변경 없음
    if (noChange)
        return;
    // ② 직전 스냅샷과 동일
    const lastSnap = prop.snapshots.at(-1);
    if (lastSnap && lastSnap.hash === hash)
        return;
    // ③ 새 스냅샷 저장
    prop.snapshots.push({ rawXml, parsed, hash, fetchedAt: new Date() });
    await prop.save();
    /* 🔹 diff 계산 & Alert 생성 */
    if (!lastSnap) {
        console.log('[REGISTRY] first snapshot stored for', prop.uniqueNo);
        return;
    }
    const delta = (0, deep_diff_1.default)(lastSnap.parsed, parsed) ?? [];
    const touched = new Set();
    let created = 0;
    for (const d of delta) {
        const type = (0, diffClassifier_1.classify)(d);
        if (type === 'UNKNOWN') {
            console.log('[DEBUG] UNKNOWN', JSON.stringify(d, null, 2));
            continue;
        }
        const pathStr = (d.path ?? []).join('.');
        const seenKey = `${type}:${pathStr}`;
        if (touched.has(seenKey))
            continue;
        touched.add(seenKey);
        // deep-diff의 union 타입 안전 처리
        const lhs = 'lhs' in d ? d.lhs : undefined;
        const rhs = 'rhs' in d ? d.rhs : undefined;
        const diffHash = sha256(`${prop.uniqueNo}|${type}|${pathStr}|${JSON.stringify(lhs)}|${JSON.stringify(rhs)}`);
        if (await alert_model_1.Alert.exists({ diffHash }))
            continue;
        /* 📄 PDF 자동 생성 */
        const addr = `${prop.addressBasic}${prop.addressDetail ? ` ${prop.addressDetail}` : ''}`;
        const pdf = await (0, pdf_1.generatePdf)(type.toLowerCase(), {
            address: addr,
            uniqueNo: prop.uniqueNo,
            diffPath: pathStr,
            lhs,
            rhs,
        });
        await alert_model_1.Alert.create({
            property: prop._id,
            type: type,
            diff: d,
            diffHash,
            pdf, // pdf.s3Key / pdf.hash 서브도큐먼트
            sent: false,
        });
        created++;
    }
    console.log('[REGISTRY] diff detected for', prop.uniqueNo, `(new=${created})`);
}
/* ─────────────────────────────────────────────
   4. 유틸: SHA-256
   ─────────────────────────────────────────── */
function sha256(text) {
    return crypto_1.default.createHash('sha256').update(text).digest('hex');
}
