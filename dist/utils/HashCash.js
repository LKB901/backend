"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.putHashInCache = putHashInCache;
const async_mutex_1 = require("async-mutex");
const chainAttatchedObject_1 = require("../services/chainAttatchedObject");
const cache = new Map();
const mutex = new async_mutex_1.Mutex();
const maxSize = 9;
const cleanupInterval = 10000;
function putHashInCache(id, hash) {
    return mutex.runExclusive(async () => {
        if (cache.size + 1 >= maxSize)
            await doAddHashesInChain();
        else
            cache.set(id, hash);
    });
}
async function cleanup() {
    if (cache.size == 0)
        return;
    await doAddHashesInChain();
}
async function doAddHashesInChain() {
    const valuesArray = Array.from(cache.values());
    await (0, chainAttatchedObject_1.addHashesAtchain)(valuesArray);
    cache.clear();
}
async function startInterval() {
    await mutex.runExclusive(async () => {
        await cleanup();
    });
    setTimeout(startInterval, cleanupInterval);
}
startInterval();
