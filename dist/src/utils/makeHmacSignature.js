"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeHmacSignature = makeHmacSignature;
// src/utils/makeHmacSignature.ts
const crypto_1 = __importDefault(require("crypto"));
/**
 * Solapi HMAC-SHA256 서명 생성
 * @param apiSecret  콘솔에서 발급받은 API Secret
 * @param date       ISO-8601 형식의 날짜 문자열 (예: new Date().toISOString())
 * @param salt       UUID 등 임의의 salt
 */
function makeHmacSignature(apiSecret, date, salt) {
    const h = crypto_1.default.createHmac('sha256', apiSecret);
    h.update(date + salt); // Solapi 문서 기준: date + salt
    return h.digest('hex');
}
