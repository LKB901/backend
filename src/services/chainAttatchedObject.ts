import Web3 from "web3";
import fs from 'fs';
import dotenv from "dotenv";

dotenv.config({path:"../../env"});

const contractJsonPath = "../backend/blockchain/ignition/deployments/chain-11155111/artifacts/HashStorageModule#HashStorage.json"
const contractJsonRaw = fs.readFileSync(contractJsonPath, 'utf8');
const contractAbi = JSON.parse(contractJsonRaw).abi;

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.SEPOLIA_RPC_URL as string));
const contract = new web3.eth.Contract(contractAbi, process.env.CONTRACT_ADDR);

export async function addHashesAtchain(hashes: string[]): Promise<string[]> {
    const existResult: boolean[] = await contract.methods.getHashExist(hashes).call();

    let filtered= hashes.filter((_, index) => !existResult[index]);
    let notInclude= hashes.filter((_, index) => existResult[index]);
    if(filtered.length==0){
        return notInclude;
    }
    const tx = {
        to: process.env.CONTRACT_ADDR,
        data: contract.methods.addHashes(filtered).encodeABI(),
        gas: 2000000,
        gasPrice: await web3.eth.getGasPrice()
    };

    const signed = await web3.eth.accounts.signTransaction(tx, process.env.PRIVATE_KEY as `0x${string}`);
    await web3.eth.sendSignedTransaction(signed.rawTransaction);

    return notInclude;
}

export async function getHashExist(hash:string) : Promise<boolean>{
    const param = [hash];
    const existResult: boolean[] = await contract.methods.getHashExist(param).call();
    return existResult[0];
}