"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256 = sha256;
exports.keccak256 = keccak256;
const crypto_1 = __importDefault(require("crypto"));
function sha256(txt) {
    return crypto_1.default.createHash('sha256').update(txt).digest('hex');
}
function keccak256(txt) {
    return crypto_1.default.createHash('keccak256').update(txt).digest('hex');
}
