"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.putHashInCache = putHashInCache;
const async_mutex_1 = require("async-mutex");
const chainAttatchedObject_1 = require("../services/chainAttatchedObject");
const cache = new Map();
const mutex = new async_mutex_1.Mutex();
const maxSize = 9;
const cleanupInterval = 1000;
function putHashInCache(hash) {
    return mutex.runExclusive(async () => {
        if (cache.size + 1 >= maxSize)
            await doAddHashesInChain();
    });
}
function cleanup() {
    return mutex.runExclusive(async () => {
        if (cache.size != 0)
            return;
        await doAddHashesInChain();
    });
}
async function doAddHashesInChain() {
    const valuesArray = Array.from(cache.values());
    valuesArray.push(hash);
    const unAdded = await (0, chainAttatchedObject_1.addHashesAtchain)(valuesArray);
    const leftKeys = Array.from(cache.entries())
        .filter(([key, value]) => unAdded.includes(value))
        .map(([key, _]) => key);
    const dbUpdateMap = new Map(Array.from(cache.entries()).filter(([key, value]) => !unAdded.includes(value)));
}
