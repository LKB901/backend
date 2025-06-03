"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alert = void 0;
const mongoose_1 = require("mongoose");
/* ── 스키마 ─────────────────────────────────────── */
const alertSchema = new mongoose_1.Schema({
    property: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property', required: true },
    type: {
        type: String,
        required: true,
        enum: [
            'OWNER_CHANGE',
            'LIEN_ADD',
            'LIEN_EDIT',
            'LIEN_REMOVE',
            'AUCTION_START',
            'AUCTION_END',
        ],
    },
    diff: mongoose_1.Schema.Types.Mixed,
    sent: { type: Boolean, default: false },
    diffHash: { type: String, index: true, unique: true },
    /** pdf → 서브도큐먼트 */
    pdf: {
        s3Key: { type: String, required: true },
        hash: { type: String, required: true },
    },
    createdAt: { type: Date, default: Date.now },
}, { versionKey: false });
/* ── 모델 ───────────────────────────────────────── */
exports.Alert = (0, mongoose_1.model)('Alert', alertSchema);
