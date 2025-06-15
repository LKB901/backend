import crypto from 'crypto';
import {keccak256,toUtf8Bytes,ethers} from "ethers";

export function getsha256HashStr(txt: string) {
    return crypto.createHash('sha256').update(txt).digest('hex');
}

export function getKeccak256HashStr(txt: string){
    return keccak256(toUtf8Bytes(txt));
}

export function hexlify(hashStr: string){
    return ethers.hexlify(ethers.getBytes(hashStr));
}