// src/utils/makeHmacSignature.ts
import crypto from 'crypto';

/**
 * Solapi HMAC-SHA256 서명 생성
 * @param apiSecret  콘솔에서 발급받은 API Secret
 * @param date       ISO-8601 형식의 날짜 문자열 (예: new Date().toISOString())
 * @param salt       UUID 등 임의의 salt
 */
export function makeHmacSignature(
  apiSecret: string,
  date: string,
  salt: string
): string {
  const h = crypto.createHmac('sha256', apiSecret);
  h.update(date + salt);   // Solapi 문서 기준: date + salt
  return h.digest('hex');
}
