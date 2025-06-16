"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getsha256HashStr = getsha256HashStr;
exports.getKeccak256HashStr = getKeccak256HashStr;
exports.hexlify = hexlify;
const crypto_1 = __importDefault(require("crypto"));
const ethers_1 = require("ethers");
function getsha256HashStr(txt) {
    return crypto_1.default.createHash('sha256').update(txt).digest('hex');
}
function getKeccak256HashStr(txt) {
    return (0, ethers_1.keccak256)((0, ethers_1.toUtf8Bytes)(txt));
}
function hexlify(hashStr) {
    return ethers_1.ethers.hexlify(ethers_1.ethers.getBytes(hashStr));
}
