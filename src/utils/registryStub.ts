// __stubs__/registry/<uniqueNo>/<n>.json 순차 반환 + normalize
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

import { normalize } from './registryNormalize';
import { RegistryResult } from './registryApi';

const ROOT = path.resolve('__stubs__/registry');
console.log('[STUB] registry root =', ROOT);

const cursor: Record<string, number> = {};

export async function fetchRegistryStub(uniqueNo: string): Promise<RegistryResult> {
  const dir = path.join(ROOT, uniqueNo);
  cursor[uniqueNo] = (cursor[uniqueNo] ?? 0) + 1;

  let jsonPath = path.join(dir, `${cursor[uniqueNo]}.json`);

  // 더 읽을 파일이 없으면 noChange 플래그
  if (!existsSync(jsonPath)) {
    cursor[uniqueNo]--;
    jsonPath = path.join(dir, `${cursor[uniqueNo]}.json`);
    const data = await fs.readFile(jsonPath, 'utf8');
    const parsed = normalize(JSON.parse(data));
    return { rawXml: `<xml>${data}</xml>`, parsed, hash: sha256(data), noChange: true };
  }

  const data   = await fs.readFile(jsonPath, 'utf8');
  const parsed = normalize(JSON.parse(data));
  const hash   = sha256(data);

  console.log('[STUB] return', { uniqueNo, jsonPath });
  return { rawXml: `<xml>${data}</xml>`, parsed, hash };
}

function sha256(t: string) {
  return crypto.createHash('sha256').update(t).digest('hex');
}
