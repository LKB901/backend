// src/middleware/auth.guard.ts
import type { Request, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthReq extends Request {
  /** JWT에서 꺼낸 사용자 식별자 */
  agentId?: string;
}

/** JWT → agentId 추출 */
export const authGuard: RequestHandler = (req, res, next) => {
  const hdr = req.headers.authorization;

  // 1) 토큰 없으면 401
  if (!hdr?.startsWith('Bearer ')) {
    res.status(401).json({ msg: 'no token' });
    return;                 // ← void 반환
  }

  try {
    // 2) 유효 토큰이면 agentId 주입
    const { sub } = jwt.verify(hdr.slice(7), process.env.JWT_SECRET!) as any;
    (req as unknown as AuthReq).agentId = sub;
    next();
  } catch {
    // 3) 잘못된 토큰 → 401
    res.status(401).json({ msg: 'bad token' });
  }
};
