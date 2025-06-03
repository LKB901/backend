// src/types/express.d.ts  (아무 .ts/.d.ts 파일에서도 OK)
import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    agentId?: string;   // 모든 req 객체에서 타입 안전하게 사용 가능
  }
}
