"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongo = connectMongo;
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
/**
 * Vercel 서버리스 환경에서도 재사용 가능한 Mongo 커넥터
 *  - 글로벌 변수에 캐시해 중복 연결 방지
 *  - `MONGODB_URI`, `MONGO_DB` 환경 변수 사용
 */
const globalAny = global;
async function connectMongo() {
    // 이미 연결돼 있으면 즉시 재사용
    if (globalAny.mongooseConn)
        return globalAny.mongooseConn;
    // mongoose 7 : strictQuery false 권장
    mongoose_1.default.set('strictQuery', false);
    const uri = process.env.MONGODB_URI || process.env.MONGO_URL;
    const db = process.env.MONGO_DB || 'lease_contract_kiosk';
    if (!uri)
        throw new Error('❌ MONGODB_URI/MONGO_URL env var missing');
    globalAny.mongooseConn = mongoose_1.default.connect(uri, {
        dbName: db,
        bufferCommands: false, // 서버리스에서 권장
    });
    await globalAny.mongooseConn;
    console.log('[DB] Mongo connected →', db);
    return globalAny.mongooseConn;
}
