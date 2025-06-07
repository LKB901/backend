import crypto from 'crypto';

export function sha256(txt: string) {
    return crypto.createHash('sha256').update(txt).digest('hex');
}

export function keccak256(txt: string){
    return crypto.createHash('keccak256').update(txt).digest('hex');
}

