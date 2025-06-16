"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addHashesAtchain = addHashesAtchain;
exports.getHashExist = getHashExist;
require("dotenv/config"); // .env 자동 로드 (backend/.env)
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const web3_1 = __importDefault(require("web3"));
/* ── 1. ABI + 주소 JSON 경로 계산 ─────────────────────────── */
/*  • dist/services → ../../blockchain/...  (빌드)
    • src/services  → ../blockchain/...     (개발, ts-node-dev) */
const artifactPath = process.env.CONTRACT_ARTIFACT ??
    path_1.default.resolve(__dirname, __dirname.includes(path_1.default.sep + 'dist' + path_1.default.sep) ? '../../' : '../', 'blockchain', 'ignition', 'deployments', 'chain-11155111', 'artifacts', 'HashStorageModule#HashStorage.json');
if (!fs_1.default.existsSync(artifactPath)) {
    throw new Error(`❌ Contract artifact not found at: ${artifactPath}`);
}
const { abi, address: deployedAddress } = JSON.parse(fs_1.default.readFileSync(artifactPath, 'utf8'));
/* ── 2. Web3 초기화 ────────────────────────────────────────── */
const rpcUrl = process.env.SEPOLIA_RPC_URL;
const privKey = process.env.PRIVATE_KEY;
const ctrAddr = process.env.ETH_ACCOUNT_ADDR ?? deployedAddress;
if (!rpcUrl)
    throw new Error('❌ SEPOLIA_RPC_URL env var not set');
if (!privKey)
    throw new Error('❌ PRIVATE_KEY env var not set');
if (!ctrAddr)
    throw new Error('❌ ETH_ACCOUNT_ADDR env var not set');
const web3 = new web3_1.default(new web3_1.default.providers.HttpProvider(rpcUrl));
const contract = new web3.eth.Contract(abi, ctrAddr);
/* ── 3. 체인 연동 함수 ────────────────────────────────────── */
async function addHashesAtchain(hashes) {
    const exists = (await contract.methods.getHashExist(hashes).call());
    const newOnes = hashes.filter((_, i) => !exists[i]);
    const skipped = hashes.filter((_, i) => exists[i]);
    if (newOnes.length === 0)
        return skipped;
    const tx = {
        to: ctrAddr,
        data: contract.methods.addHashes(newOnes).encodeABI(),
        gas: 2000000,
        gasPrice: await web3.eth.getGasPrice(),
    };
    const signed = await web3.eth.accounts.signTransaction(tx, privKey);
    if (!signed.rawTransaction)
        throw new Error('❌ Failed to sign transaction');
    await web3.eth.sendSignedTransaction(signed.rawTransaction);
    return skipped;
}
async function getHashExist(hash) {
    const [exists] = (await contract.methods.getHashExist([hash]).call());
    return exists;
}
