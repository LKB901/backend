"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Listing = void 0;
const mongoose_1 = require("mongoose");
const listingSchema = new mongoose_1.Schema({
    property: { type: mongoose_1.Types.ObjectId, ref: 'Property', required: true },
    landlord: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true },
    agent: { type: mongoose_1.Types.ObjectId, ref: 'Agent', required: true },
    status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' },
    createdAt: { type: Date, default: Date.now }
});
listingSchema.index({ agent: 1, status: 1 });
exports.Listing = (0, mongoose_1.model)('Listing', listingSchema);
