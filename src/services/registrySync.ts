import cron from 'node-cron';
import {sha256} from '../utils/crypt';
import deepDiff, { Diff } from 'deep-diff';

import { Property, PropertyDoc } from '../models/property.model';
import { Alert, AlertType } from '../models/alert.model';
import { fetchRegistry, RegistryResult } from '../utils/registryApi';
import { classify } from '../utils/diffClassifier';
import { generatePdf } from '../utils/pdf';

/* ─────────────────────────────────────────────
   1. 크론 잡 등록
   ─────────────────────────────────────────── */
export function startRegistryCron(): void {
  const rule = process.env.REGISTRY_CRON ?? '* * * * *';
  console.log('[CRON] preparing registry cron on rule', rule);
  try {
    cron.schedule(rule, run, { timezone: 'Asia/Seoul' });
    console.log('[CRON] registry cron scheduled ✓');
  } catch (err) {
    console.error('[CRON] registry schedule FAILED →', err);
  }
}

/* ─────────────────────────────────────────────
   2. Tick 실행 함수
   ─────────────────────────────────────────── */
async function run(): Promise<void> {
  console.log('[CRON] registry tick', new Date().toLocaleTimeString());

  let props: PropertyDoc[];
  try {
    props = await Property.find();
    console.log('[CRON] props.length =', props.length);
  } catch (err) {
    console.error('[CRON] find() error →', err);
    return;
  }

  for (const prop of props) {
    try {
      await processProperty(prop);
    } catch (err) {
      console.error('[CRON] processProperty error for', prop.uniqueNo, err);
    }
  }
}

/* ─────────────────────────────────────────────
   3. 개별 Property 처리
   ─────────────────────────────────────────── */
async function processProperty(prop: PropertyDoc): Promise<void> {
  // 등기부 조회 (stub 포함)
  const { rawXml, parsed, hash, noChange } =
    (await fetchRegistry(prop.uniqueNo)) as RegistryResult;

  // ① 변경 없음
  if (noChange) return;

  // ② 직전 스냅샷과 동일
  const lastSnap = prop.snapshots.at(-1);
  if (lastSnap && lastSnap.hash === hash) return;

  // ③ 새 스냅샷 저장
  prop.snapshots.push({ rawXml, parsed, hash, fetchedAt: new Date() });
  await prop.save();

  /* 🔹 diff 계산 & Alert 생성 */
  if (!lastSnap) {
    console.log('[REGISTRY] first snapshot stored for', prop.uniqueNo);
    return;
  }

  const delta = deepDiff(lastSnap.parsed, parsed) ?? [];
  const touched = new Set<string>();
  let created = 0;

  for (const d of delta as Diff<any, any>[]) {
    const type = classify(d);
    if (type === 'UNKNOWN') {
      console.log('[DEBUG] UNKNOWN', JSON.stringify(d, null, 2));
      continue;
    }

    const pathStr = (d.path ?? []).join('.');
    const seenKey = `${type}:${pathStr}`;
    if (touched.has(seenKey)) continue;
    touched.add(seenKey);

    // deep-diff의 union 타입 안전 처리
    const lhs = 'lhs' in d ? (d as any).lhs : undefined;
    const rhs = 'rhs' in d ? (d as any).rhs : undefined;

    const diffHash = sha256(
      `${prop.uniqueNo}|${type}|${pathStr}|${JSON.stringify(lhs)}|${JSON.stringify(rhs)}`
    );

    if (await Alert.exists({ diffHash })) continue;

    /* 📄 PDF 자동 생성 */
    const addr = `${prop.addressBasic}${prop.addressDetail ? ` ${prop.addressDetail}` : ''}`;
    const pdf = await generatePdf(type.toLowerCase(), {
      address: addr,
      uniqueNo: prop.uniqueNo,
      diffPath: pathStr,
      lhs,
      rhs,
    });

    await Alert.create({
      property: prop._id,
      type: type as AlertType,
      diff: d,
      diffHash,
      pdf,      // pdf.s3Key / pdf.hash 서브도큐먼트
      sent: false,
    });

    created++;
  }

  console.log('[REGISTRY] diff detected for', prop.uniqueNo, `(new=${created})`);
}