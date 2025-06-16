"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/agent.routes.ts
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const s3_1 = require("../utils/s3");
const auth_guard_1 = require("../middleware/auth.guard");
const LOCAL = process.env.LOCAL_STORAGE === "true";
const SECRET = process.env.JWT_SECRET; // 환경변수 검증은 별도에서!
const router = (0, express_1.Router)();
/* ───────── 공인중개사 가입 ───────── */
router.post("/", s3_1.uploadForm.single("idImage"), async (req, res) => {
    if (!req.file) {
        res.status(400).json({ msg: "idImage missing" });
        return;
    }
    const { email, password, brokerNo } = req.body;
    const pwHash = await bcrypt_1.default.hash(password, 10);
    const idImageKey = LOCAL ? req.file.path : req.file.key;
    const agent = await models_1.Agent.create({
        email,
        pwHash,
        brokerNo,
        idImage: idImageKey,
    });
    res.status(201).json({ id: agent._id, msg: "wait for approval" });
});
/* ───────── 관리자 승인 ───────── */
router.patch("/:id/approve", async (req, res) => {
    await models_1.Agent.findByIdAndUpdate(req.params.id, { approved: true });
    res.json({ msg: "approved" });
});
/* ───────── 로그인 ───────── */
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const agent = await models_1.Agent.findOne({ email, approved: true }).select('_id pwHash');
    if (!agent) {
        res.status(401).json({ msg: "no account or not approved" });
        return;
    }
    const ok = await bcrypt_1.default.compare(password, agent.pwHash);
    if (!ok) {
        res.status(401).json({ msg: "bad pw" });
        return;
    }
    const token = jsonwebtoken_1.default.sign({ sub: agent }, SECRET, { expiresIn: "8h" });
    console.log(agent);
    res.json({ token: token, id: agent._id });
});
router.get('/agentInfo/:id', auth_guard_1.authGuard, async (req, res) => {
    const id = req.agentId;
    console.log(id);
    // console.log(req.params.id);
    if (req.params.id != id) {
        res.status(401).json({ msg: 'other agent' });
        return;
    }
    const agentInfo = await models_1.Agent.findById(id).select('name manageProperties');
    console.log(agentInfo);
    res.json(agentInfo);
});
exports.default = router;
