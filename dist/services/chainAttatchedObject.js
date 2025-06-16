"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addHashesAtchain = addHashesAtchain;
exports.getHashExist = getHashExist;
const web3_1 = __importDefault(require("web3"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: "../../env" });
const contractJsonPath = "../backend/blockchain/ignition/deployments/chain-11155111/artifacts/HashStorageModule#HashStorage.json";
const contractJsonRaw = fs_1.default.readFileSync(contractJsonPath, 'utf8');
const contractAbi = JSON.parse(contractJsonRaw).abi;
const web3 = new web3_1.default(new web3_1.default.providers.HttpProvider(process.env.SEPOLIA_RPC_URL));
const contract = new web3.eth.Contract(contractAbi, process.env.CONTRACT_ADDR);
async function addHashesAtchain(hashes) {
    const existResult = await contract.methods.getHashExist(hashes).call();
    let filtered = hashes.filter((_, index) => !existResult[index]);
    let notInclude = hashes.filter((_, index) => existResult[index]);
    if (filtered.length == 0) {
        return notInclude;
    }
    const tx = {
        to: process.env.CONTRACT_ADDR,
        data: contract.methods.addHashes(filtered).encodeABI(),
        gas: 2000000,
        gasPrice: await web3.eth.getGasPrice()
    };
    const signed = await web3.eth.accounts.signTransaction(tx, process.env.PRIVATE_KEY);
    await web3.eth.sendSignedTransaction(signed.rawTransaction);
    return notInclude;
}
async function getHashExist(hash) {
    const param = [hash];
    const existResult = await contract.methods.getHashExist(param).call();
    return existResult[0];
}
