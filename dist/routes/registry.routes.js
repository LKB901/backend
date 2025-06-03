"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const registry_model_1 = require("../models/registry.model");
const registryEvent_model_1 = require("../models/registryEvent.model");
const auth_guard_1 = require("../middleware/auth.guard");
const registryApi_1 = require("../utils/registryApi");
const registryStub_1 = require("../utils/registryStub");
const router = (0, express_1.Router)();
/* ───────── 최신 스냅샷 조회 ─────────  GET /registry/:propId */
router.get('/:propId', auth_guard_1.authGuard, async (req, res, next) => {
    try {
        const snap = await registry_model_1.Registry
            .findOne({ property: req.params.propId })
            .sort({ fetchedAt: -1 })
            .lean();
        if (!snap)
            return void res.status(404).json({ msg: 'no snapshot' });
        res.json(snap);
    }
    catch (err) {
        next(err);
    }
});
/* ───────── 변동 이력 조회 ─────────  GET /registry/:propId/events */
router.get('/:propId/events', auth_guard_1.authGuard, async (req, res, next) => {
    try {
        const list = await registryEvent_model_1.RegistryEvent
            .find({ property: req.params.propId })
            .sort({ detectedAt: -1 })
            .lean();
        res.json(list);
    }
    catch (err) {
        next(err);
    }
});
/* ───────── 수동 갱신(디버그) ─────────  POST /registry/:propId/refresh */
router.post('/:propId/refresh', auth_guard_1.authGuard, async (req, res, next) => {
    try {
        // 1) id로 문서를 찾고 populate
        const propDoc = await registry_model_1.Registry
            .findById(req.params.propId)
            .populate('property');
        if (!propDoc)
            return void res.status(404).json({ msg: 'property not found' });
        // 2) 주소 꺼내기
        const { addressBasic } = propDoc.property;
        // 3) 실 API vs 스텁
        const data = process.env.REGISTRY_API_KEY
            ? await (0, registryApi_1.fetchRegistry)(addressBasic)
            : await (0, registryStub_1.fetchRegistryStub)(addressBasic);
        // TODO: 새 스냅샷 저장 로직이 있다면 추가
        res.json({ fetched: data.hash });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
