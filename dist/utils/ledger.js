"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToLedger = void 0;
const sendToLedger = async ({ contractId, hash }) => {
    // TODO: 실제 블록 생성 & 트랜잭션 전송 로직
    console.log(`[LEDGER TX] contract=${contractId}, hash=${hash}`);
};
exports.sendToLedger = sendToLedger;
