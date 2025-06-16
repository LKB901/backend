"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_1 = require("../models");
const auth_guard_1 = require("../middleware/auth.guard");
const chainAttatchedObject_1 = require("../services/chainAttatchedObject");
const router = (0, express_1.Router)();
router.get('/contractHash/:hash', auth_guard_1.authGuard, async (req, res) => {
    try {
        const hash = req.params.hash;
        if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
            res.status(400).json({ error: 'Invalid hash format' });
            return;
        }
        const result = await (0, chainAttatchedObject_1.getHashExist)(hash);
        res.status(200).json({ result });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/auditLog/:id', auth_guard_1.authGuard, async (req, res) => {
    const contractId = req.params.hash;
    const contract = await models_1.Contract.findById(contractId).select('participants').lean();
    if (!contract) {
        res.status(400).json({ error: 'no Contract' });
        return;
    }
    // 2. participantId → name, role 매핑용 Map 생성
    const participantsMap = new Map();
    // for (const participant of contract.participants) {
    //     participantsMap.set(participant._id.toString(), {
    //         name: participant.name,
    //         role: participant.role
    //     });
    // }
    // 3. AuditLog에서 해당 contract의 로그 조회
    const logs = await models_1.AuditLog.find({ contract: contractId })
        .select('action timestamp participant')
        .lean();
    // 4. participant 정보 매핑해서 결과 생성
    const enrichedLogs = logs.map(log => {
        const participantInfo = log.participant
            ? participantsMap.get(log.participant.toString())
            : null;
        return {
            action: log.action,
            timestamp: log.timestamp,
            participant: participantInfo || null
        };
    });
    res.status(200).json(enrichedLogs);
});
// router.get('/agent/:num', authGuard, async (req: AuthReq, res: Response): Promise<void> => {
//     const brokerNum= req.params.num;
//
// });
//
// router.post('/landLord', authGuard, async (req: AuthReq, res: Response): Promise<void> => {
//     const { email,  } = req.body as { email: string; password: string };
// });
exports.default = router;
