"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const contract_model_1 = require("../models/contract.model");
const router = (0, express_1.Router)();
/**
 * POST /pass/mock-verify
 * body: { contractId, participantId, phoneNum, name }
 *  → 임시 CI를 생성해 저장하고 verified=true 로 마킹
 */
router.post('/mock-verify', async (req, res, next) => {
    try {
        const { contractId, participantId, phoneNum = '', name = '' } = req.body;
        if (!contractId || !participantId)
            return void res.status(400).json({ message: 'contractId & participantId are required' });
        const contract = await contract_model_1.Contract.findById(contractId);
        if (!contract)
            return void res.status(404).json({ message: 'contract not found' });
        const participant = contract.participants /* DocumentArray */.id(participantId);
        if (!participant)
            return void res.status(404).json({ message: 'participant not found' });
        // CI = SHA-256(phone + name) 40byte mock
        participant.ci = crypto_1.default
            .createHash('sha256')
            .update(`${phoneNum}:${name}`)
            .digest('hex')
            .slice(0, 40);
        participant.verified = true;
        await contract.save();
        res.json({ ci: participant.ci });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
