"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLog = void 0;
const mongoose_1 = require("mongoose");
const auditSchema = new mongoose_1.Schema({
    contract: { type: mongoose_1.Schema.Types.ObjectId, ref: 'contracts', required: true },
    action: { type: String, enum: ['created', 'written', 'update', 'signed', 'dispute', 'terminate'], required: true },
    participant: { type: mongoose_1.Schema.Types.ObjectId },
    timestamp: { type: Date, default: () => new Date() }
}, { versionKey: false });
exports.AuditLog = (0, mongoose_1.model)('auditlogs', auditSchema);
