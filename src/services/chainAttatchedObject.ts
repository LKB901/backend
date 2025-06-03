import Web3 from "web3";
import fs from 'fs';
import dotenv from "dotenv";

dotenv.config({path:"../../env"});

const contractJsonPath = "../../blockchain/ignition/deployments/chain-11155111/artifacts/HashStorageModule#HashStorage.json"
const contractJsonRaw = fs.readFileSync(contractJsonPath, 'utf8');
const contractAbi = JSON.parse(contractJsonRaw).abi;

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.SEPOLIA_RPC_URL as string));
const contract = new web3.eth.Contract(contractAbi, process.env.CONTRACT_ADDR);

export async function AddHashesAtchain(){

}