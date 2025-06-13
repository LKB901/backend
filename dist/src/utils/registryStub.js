"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRegistryStub = fetchRegistryStub;
// __stubs__/registry/<uniqueNo>/<n>.json 순차 반환 + normalize
const promises_1 = __importDefault(require("fs/promises"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const registryNormalize_1 = require("./registryNormalize");
const ROOT = path_1.default.resolve('__stubs__/registry');
console.log('[STUB] registry root =', ROOT);
const cursor = {};
async function fetchRegistryStub(uniqueNo) {
    const dir = path_1.default.join(ROOT, uniqueNo);
    cursor[uniqueNo] = (cursor[uniqueNo] ?? 0) + 1;
    let jsonPath = path_1.default.join(dir, `${cursor[uniqueNo]}.json`);
    // 더 읽을 파일이 없으면 noChange 플래그
    if (!(0, fs_1.existsSync)(jsonPath)) {
        cursor[uniqueNo]--;
        jsonPath = path_1.default.join(dir, `${cursor[uniqueNo]}.json`);
        const data = await promises_1.default.readFile(jsonPath, 'utf8');
        const parsed = (0, registryNormalize_1.normalize)(JSON.parse(data));
        return { rawXml: `<xml>${data}</xml>`, parsed, hash: sha256(data), noChange: true };
    }
    const data = await promises_1.default.readFile(jsonPath, 'utf8');
    const parsed = (0, registryNormalize_1.normalize)(JSON.parse(data));
    const hash = sha256(data);
    console.log('[STUB] return', { uniqueNo, jsonPath });
    return { rawXml: `<xml>${data}</xml>`, parsed, hash };
}
function sha256(t) {
    return crypto_1.default.createHash('sha256').update(t).digest('hex');
}
