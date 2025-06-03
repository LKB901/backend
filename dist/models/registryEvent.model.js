"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistryEvent = void 0;
const mongoose_1 = require("mongoose");
const RegistryEventSchema = new mongoose_1.Schema({
    property: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property', required: true },
    prevHash: { type: String, required: true },
    newHash: { type: String, required: true },
    diff: { type: String, required: true },
    detectedAt: { type: Date, default: Date.now }
});
exports.RegistryEvent = (0, mongoose_1.model)('RegistryEvent', RegistryEventSchema);
