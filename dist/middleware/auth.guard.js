"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authGuard = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/** JWT → agentId 추출 */
const authGuard = (req, res, next) => {
    const hdr = req.headers.authorization;
    // 1) 토큰 없으면 401
    if (!hdr?.startsWith('Bearer ')) {
        res.status(401).json({ msg: 'no token' });
        return; // ← void 반환
    }
    try {
        // 2) 유효 토큰이면 agentId 주입
        const { sub } = jsonwebtoken_1.default.verify(hdr.slice(7), process.env.JWT_SECRET);
        req.agentId = sub;
        next();
    }
    catch {
        // 3) 잘못된 토큰 → 401
        res.status(401).json({ msg: 'bad token' });
    }
};
exports.authGuard = authGuard;
