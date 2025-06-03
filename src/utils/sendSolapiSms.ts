import axios from 'axios';
import crypto from 'crypto';
import { makeHmacSignature } from './makeHmacSignature';

/* ── Solapi 환경변수 ────────────────────────────── */
const SOLAPI_URL    = 'https://api.solapi.com/messages/v4/send-many';
const SOLAPI_FROM   = process.env.SOLAPI_FROM!;      // “029302266” 같이 사전에 등록된 발신번호
const SOLAPI_KEY    = process.env.SOLAPI_API_KEY!;
const SOLAPI_SECRET = process.env.SOLAPI_SECRET!;

/* ── 런타임 전역 stub 플래그 ───────────────────────
   ▸ .env 로 stub(=테스트)모드를 강제할 수도 있고,
   ▸ 실제 발송 중 402 (NotEnoughBalance) 가 뜨면
     → 이하 모든 호출을 stub 으로 전환한다.              */
let forceStub = false;

export async function sendSolapiSms(
  to: string,
  text: string,
  stub = process.env.NODE_ENV !== 'production'        // 기본: 개발환경이면 stub
): Promise<void> {
  /* 1) .env 가 켜져 있거나, 전역 전환되었으면 stub 처리 */
  if (stub || forceStub) {
    console.log('(stub sms)', { to, text });
    return;
  }

  /* 2) 실제 발송 시도 */
  const date = new Date().toISOString();
  const salt = crypto.randomUUID();
  const signature = makeHmacSignature(SOLAPI_SECRET, date, salt);

  try {
    await axios.post(
      SOLAPI_URL,
      {
        messages: [{ to, from: SOLAPI_FROM, text }],
      },
      {
        timeout: 5_000,
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            `HMAC-SHA256 apiKey=${SOLAPI_KEY}, date=${date}, salt=${salt}, signature=${signature}`,
        },
      },
    );
  } catch (err: any) {
    /* 3) 402(잔액 부족) → stub 모드로 전환 후 메시지 로그만 남김 */
    const status   = err?.response?.status;
    const errCode  = err?.response?.data?.errorCode;
    const noCredit = status === 402 || errCode === 'NotEnoughBalance';

    if (noCredit) {
      console.warn('[SMS] 잔액 부족 → 이후 stub 모드로 전환');
      forceStub = true;                     // 전역 전환
      console.log('(stub sms)', { to, text });
      return;                               // 실패로 간주하지 않음
    }

    /* 4) 그 밖의 오류는 상위로 전파 */
    console.error('[SMS] 전송 실패', err);
    throw err;
  }
}
