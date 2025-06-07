// 실 API ↔ 스텁 전환 + XML→JSON 파싱
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import {sha256} from "./crypt";
import { normalize } from './registryNormalize';
import { fetchRegistryStub } from './registryStub';

const {
  USE_STUB_REGISTRY,
  REGISTRY_API_BASE,
  REGISTRY_API_KEY,
  REGISTRY_TIMEOUT_MS = '10000',
} = process.env;

export interface RegistryResult {
  rawXml:  string;
  parsed:  any;     // 이미 normalize 완료
  hash:    string;
  noChange?: boolean;
}

export async function fetchRegistry(uniqueNo: string): Promise<RegistryResult> {
  /* ── 1. 스텁 모드 ────────────────────────────── */
  if (USE_STUB_REGISTRY === 'true') {
    return fetchRegistryStub(uniqueNo);             // ← 내부에서 normalize 호출
  }

  /* ── 2. 실 API 호출 ─────────────────────────── */
  const url =
    `${REGISTRY_API_BASE}?serviceKey=${REGISTRY_API_KEY}` +
    `&uniqueNo=${uniqueNo}`;                        // p.1 Key명 맞춤

  const { data } = await axios.get(url, {
    timeout: Number(REGISTRY_TIMEOUT_MS),
    responseType: 'text',
    validateStatus: s => s < 500,                  // 4xx 도 데이터 반환
  });

  const json   = await parseStringPromise(data, { explicitArray: false });
  const parsed = normalize(json);
  const hash   = sha256(data);

  return { rawXml: data, parsed, hash };
}


