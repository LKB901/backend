"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRegistry = fetchRegistry;
// 실 API ↔ 스텁 전환 + XML→JSON 파싱
const axios_1 = __importDefault(require("axios"));
const xml2js_1 = require("xml2js");
const crypt_1 = require("./crypt");
const registryNormalize_1 = require("./registryNormalize");
const registryStub_1 = require("./registryStub");
const { USE_STUB_REGISTRY, REGISTRY_API_BASE, REGISTRY_API_KEY, REGISTRY_TIMEOUT_MS = '10000', } = process.env;
async function fetchRegistry(uniqueNo) {
    /* ── 1. 스텁 모드 ────────────────────────────── */
    if (USE_STUB_REGISTRY === 'true') {
        return (0, registryStub_1.fetchRegistryStub)(uniqueNo); // ← 내부에서 normalize 호출
    }
    /* ── 2. 실 API 호출 ─────────────────────────── */
    const url = `${REGISTRY_API_BASE}?serviceKey=${REGISTRY_API_KEY}` +
        `&uniqueNo=${uniqueNo}`; // p.1 Key명 맞춤
    const { data } = await axios_1.default.get(url, {
        timeout: Number(REGISTRY_TIMEOUT_MS),
        responseType: 'text',
        validateStatus: s => s < 500, // 4xx 도 데이터 반환
    });
    const json = await (0, xml2js_1.parseStringPromise)(data, { explicitArray: false });
    const parsed = (0, registryNormalize_1.normalize)(json);
    const hash = (0, crypt_1.getsha256HashStr)(data);
    return { rawXml: data, parsed, hash };
}
