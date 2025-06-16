"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contract = void 0;
const mongoose_1 = require("mongoose");
/* ───────── 서브 스키마 ───────── */
const signedInfoSchema = new mongoose_1.Schema({
    role: { type: String, enum: ['tenant', 'landlord', 'agent'], required: true },
    signedAt: { type: Date, default: null },
    tokenUsed: { type: Boolean, default: false },
}, { _id: true });
/* ───────── 메인 스키마 ───────── */
const contractSchema = new mongoose_1.Schema({
    property: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property', required: true },
    agent: { type: mongoose_1.Schema.Types.ObjectId, ref: 'agents', required: true },
    landLord: { type: mongoose_1.Schema.Types.ObjectId, ref: 'TheParties', required: true },
    tenant: { type: mongoose_1.Schema.Types.ObjectId, ref: 'TheParties', required: true },
    state: { type: String, enum: ['draft', 'signed', 'cancelled'], default: 'draft' },
    pdfBase64: { type: String, default: null }, // 초안 단계에서는 비어 있을 수 있음
    afterSignedState: { type: String, enum: ['disputed', 'Unilateral_terminated', 'Mutual_terminated',
            'expired', 'onGoing'] },
    hasProblem: { type: Boolean, default: false },
    signedInfo: [signedInfoSchema],
}, { timestamps: true });
exports.Contract = (0, mongoose_1.model)('contracts', contractSchema);
