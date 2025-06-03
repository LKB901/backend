"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_1 = require("../models");
const router = (0, express_1.Router)();
/* 매물 등록 (주소, 건물명, 면적 등) */
router.post('/', async (req, res) => {
    const prop = await models_1.Property.create(req.body);
    res.status(201).json({ id: prop._id });
});
/* 매물 리스트 (선택적) */
router.get('/', async (_req, res) => {
    const list = await models_1.Property.find().sort({ createdAt: -1 });
    res.json(list);
});
exports.default = router;
