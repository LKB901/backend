// tools/seed.ts
import 'dotenv/config';
import mongoose from 'mongoose';
import { Landlord } from '../src/models/landlord.model';
import { Property } from '../src/models/property.model';

async function main() {
  /* 0. DB 연결 ------------------------------------------------------- */
  await mongoose.connect(process.env.MONGO_URL!);
  console.log('[SEED] Mongo connected');

  /* 1. 기존 데이터 정리 --------------------------------------------- */
  await Promise.all([
    Landlord.deleteMany({}),
    Property.deleteMany({}),
  ]);

  /* 2. 임대인(공통 식별자) 1건 생성 ---------------------------------- */
  const landlord = await Landlord.create({
    name : '홍길동',
    ci   : 'CICICICI-TEST-001',
    phone: '01012345678',
  });

  /* 3. 매물(Property) 2건 생성 -------------------------------------- */
  await Property.insertMany([
    {
      buildingName: '테스트빌라 101호',
      addressBasic: '서울특별시 강남구 ○○로 1',
      space       : 68,
      uniqueNo    : '101234567890',
      landlord    : landlord._id,  // 🔗 참조
      landlordName: landlord.name, // (검색용 캐시)
      subsEmail   : ['tenant1@example.com'],
      subsPhone   : ['01098765432'],
      snapshots   : [],
    },
    {
      buildingName: '테스트빌라 102호',
      addressBasic: '서울특별시 강남구 ○○로 1',
      space       : 71,
      uniqueNo    : '101234567891',
      landlord    : landlord._id,
      landlordName: landlord.name,
      subsEmail   : ['tenant2@example.com'],
      subsPhone   : ['01011112222'],
      snapshots   : [],
    },
  ]);

  console.log('[SEED] Done ✅');
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
