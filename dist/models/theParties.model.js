"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TheParties = void 0;
// src/models/theParties.model.ts
const mongoose_1 = require("mongoose");
const thePartiesSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    ciHash: String,
}, { timestamps: true });
// 3번째 인자를 'landlords' 로 지정하면 기존 컬렉션과 바로 매칭됨
exports.TheParties = (0, mongoose_1.model)('TheParties', thePartiesSchema, 'theParties');
