"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Property = void 0;
const mongoose_1 = require("mongoose");
const snapshotSchema = new mongoose_1.Schema({
    fetchedAt: { type: Date, default: Date.now },
    rawXml: String,
    parsed: mongoose_1.Schema.Types.Mixed,
    hash: String,
}, { _id: false });
const propertySchema = new mongoose_1.Schema({
    /* 기본 정보 */
    buildingName: { type: String, required: true },
    addressBasic: { type: String, required: true },
    addressDetail: String,
    space: { type: Number, required: true },
    uniqueNo: { type: String, index: true, required: true },
    /* 임대인 정보 */
    landlord: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Landlord', required: true },
    landlordName: String,
    /* 알림 구독 정보 */
    subsEmail: { type: [String], default: [] },
    subsPhone: { type: [String], default: [] },
    /* 스냅샷 */
    snapshots: { type: [snapshotSchema], default: [] },
}, { timestamps: true });
/* ── 모델 내보내기 ───────────────────────────────── */
exports.Property = (0, mongoose_1.model)('Property', propertySchema);
