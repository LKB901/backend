"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Landlord = void 0;
// src/models/landlord.model.ts
const mongoose_1 = require("mongoose");
const landlordSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    phone: String,
    email: String,
    ciHash: String,
}, { timestamps: true });
// 3번째 인자를 'landlords' 로 지정하면 기존 컬렉션과 바로 매칭됨
exports.Landlord = (0, mongoose_1.model)('Landlord', landlordSchema, 'landlords');
