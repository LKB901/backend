"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
const mongoose_1 = require("mongoose");
const agentSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    phoneNum: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    pwHash: { type: String, required: true },
    brokerNo: { type: String, required: true },
    idImage: { type: String, required: true },
    approved: { type: Boolean, default: false }
}, { timestamps: true });
exports.Agent = (0, mongoose_1.model)('agents', agentSchema);
