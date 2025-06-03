"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classify = void 0;
exports.classifyDiff = classifyDiff;
function classifyDiff(d) {
    const p = (d.path ?? []).join('.');
    if (p === 'owner' && d.kind === 'E')
        return 'OWNER_CHANGE';
    if (p === 'liens' && d.kind === 'A' && d.item?.kind === 'N')
        return 'LIEN_ADD';
    if (/^liens\.\d+\./.test(p) && d.kind === 'E')
        return 'LIEN_EDIT';
    if (p === 'liens' && d.kind === 'A' && d.item?.kind === 'D')
        return 'LIEN_REMOVE';
    if (p === 'auction' && d.kind === 'E' && d.rhs === true)
        return 'AUCTION_START';
    if (p === 'auction' && ((d.kind === 'E' && d.rhs === false) || d.kind === 'D'))
        return 'AUCTION_END';
    return 'UNKNOWN';
}
exports.classify = classifyDiff;
