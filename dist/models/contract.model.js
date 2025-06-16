"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contract = void 0;
const mongoose_1 = require("mongoose");
/* ───────── 서브 스키마 ───────── */
const participantSchema = new mongoose_1.Schema({
    email: { type: String, required: true },
    name: { type: String, default: '' },
    phoneNum: { type: String, default: '' },
    role: { type: String, enum: ['tenant', 'landlord'], required: true },
    verified: { type: Boolean, default: false },
    ciHash: { type: String },
    signedAt: { type: Date, default: null },
    tokenUsed: { type: Boolean, default: false },
}, { _id: true });
/* ───────── 메인 스키마 ───────── */
const contractSchema = new mongoose_1.Schema({
    property: { type: mongoose_1.Schema.Types.ObjectId, ref: 'properties', required: true },
    agent: { type: mongoose_1.Schema.Types.ObjectId, ref: 'agents', required: true },
    state: { type: String, enum: ['draft', 'pending', 'signed', 'cancelled'], default: 'draft' },
    pdfPath: { type: String }, // 초안 단계에서는 비어 있을 수 있음
    afterSignedState: { type: String, enum: ['disputed', 'Unilateral terminated', 'Mutual terminated',
            'expired', 'onGoing'] },
    hasProblem: { type: Boolean, default: false },
    finance: {
        deposit: { type: Number, required: true },
        payment: { type: Number, required: true },
        perMonth: { type: Boolean, required: true },
    },
    period: {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
    },
    participants: [participantSchema],
}, { timestamps: true });
exports.Contract = (0, mongoose_1.model)('contracts', contractSchema);
