/**
 * 기존 간이 스텁(owner / liens / auction) → 공식 응답 구조로 변환
 * 사용법: npx ts-node tools/convertStub.ts
 */
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const ROOT = path.resolve('__stubs__/registry');

async function run() {
  const props = await fs.readdir(ROOT);
  for (const unique of props) {
    const dir = path.join(ROOT, unique);
    const files = (await fs.readdir(dir)).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const full = path.join(dir, file);
      const raw  = JSON.parse(await fs.readFile(full, 'utf8'));

      // 이미 새 구조면 skip
      if ('output' in raw) continue;

      const output = {
        resUserNm: raw.owner ?? '',
        resRegisterEntriesList: (raw.liens ?? []).map((l: any, i: number) => ({
          resType: '근저당권설정',
          resContentsList: [
            { resNo: 1, resContents: l.creditor ?? '',  resEtc: '' },
            { resNo: 2, resContents: l.amt ?? '',       resEtc: '' },
          ],
        })),
        resState: raw.auction ? '경매개시결정' : '정상',
      };

      await fs.writeFile(full, JSON.stringify({ output }, null, 2), 'utf8');
      console.log('✔ converted', path.relative(ROOT, full));
    }
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
