import { Mutex } from 'async-mutex';
import {addHashesAtchain} from '../services/chainAttatchedObject';

const cache = new Map<string, string>();
const mutex = new Mutex();
const maxSize= 9;
const cleanupInterval= 10000;


export function putHashInCache(id:string, hash:string): Promise<void>{
    return mutex.runExclusive( async () => {
        if (cache.size + 1 >= maxSize)
            await doAddHashesInChain();
        else
            cache.set(id,hash);
    });
}

async function cleanup() {
    if (cache.size == 0)
        return;
    await doAddHashesInChain();
}

async function doAddHashesInChain() {
    const valuesArray = Array.from(cache.values());
    await addHashesAtchain(valuesArray);
    cache.clear();
}

async function startInterval() {
    await mutex.runExclusive(async () => {
        await cleanup();
    });
    setTimeout(startInterval, cleanupInterval);
}

startInterval();