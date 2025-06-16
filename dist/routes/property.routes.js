"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_1 = require("../models");
const auth_guard_1 = require("../middleware/auth.guard");
const router = (0, express_1.Router)();
/* 매물 등록 (주소, 건물명, 면적 등) */
router.post('/regist', auth_guard_1.authGuard, async (req, res) => {
    const id = req.agentId;
    const { propertyInfo, landlordInfo } = req.body;
    const landlord = await models_1.TheParties.findOne(landlordInfo).select('_id').exec();
    let landlordID;
    if (landlord) {
        landlordID = landlord._id;
    }
    else {
        landlordID = await models_1.TheParties.create(landlordInfo);
    }
    const newPropInfo = {
        ...propertyInfo,
        landlord: landlordID
    };
    const newProp = await models_1.Property.create(newPropInfo);
    await models_1.Agent.findByIdAndUpdate(id, { $addToSet: { manageProperty: newProp._id } }, { new: true });
    res.status(201).json({ id: newProp._id });
});
/* 매물 리스트 (선택적) */
router.get('/', async (_req, res) => {
    const list = await models_1.Property.find().sort({ createdAt: -1 });
    res.json(list);
});
exports.default = router;
