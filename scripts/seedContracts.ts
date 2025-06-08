// src/scripts/seedContracts.ts
import 'dotenv/config';
import mongoose, { Types } from 'mongoose';
import { Contract } from '../src/models/contract.model';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('[DB] connected');

  /* ── 1) 더미 데이터 배열 만들기 ───────────────────── */
  const now = new Date();
  const docs = Array.from({ length: 5 }).map((_, idx) => ({
    property : new Types.ObjectId('68382e565c77e6093c432e9f'),      // 실제 _id 로 교체
    agent    : new Types.ObjectId('68382e565c77e6093c432e9e'),      // 실제 _id 로 교체
    state    : 'draft' as const,

    finance  : {
      deposit : 1_000_0000 + idx * 500_000, // 1,000 → 3,000 …
      payment : 500_000   + idx *  50_000,  // 500 → 700 …
      perMonth: true,
    },
    period   : {
      start: now,
      end  : new Date(now.getFullYear() + 2, now.getMonth(), now.getDate()),
    },
    participants: [
      {
        email    : `tenant${idx}@example.com`,
        name     : `세입자${idx}`,
        phoneNum : `010-0000-00${idx}`,
        role     : 'tenant',
        verified : false,
        tokenUsed: false,
      },
      {
        email    : `landlord${idx}@example.com`,
        name     : `임대인${idx}`,
        phoneNum : `010-1111-11${idx}`,
        role     : 'landlord',
        verified : false,
        tokenUsed: false,
      },
    ],
  }));

  /* ── 2) 한 번에 삽입 ──────────────────────────────── */
  const result = await Contract.insertMany(docs);
  console.log(`[DB] inserted ${result.length} contracts ✓`);

  await mongoose.disconnect();
}

main().catch(console.error);
