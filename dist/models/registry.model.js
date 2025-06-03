"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Registry = void 0;
const mongoose_1 = require("mongoose");
const RegistrySchema = new mongoose_1.Schema({
    property: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property', required: true },
    rawXml: { type: String, required: true },
    hash: { type: String, required: true, index: true },
    fetchedAt: { type: Date, default: Date.now }
});
exports.Registry = (0, mongoose_1.model)('Registry', RegistrySchema);
