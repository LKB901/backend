"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalize = normalize;
function normalize(apiResp) {
    const root = apiResp?.output ?? apiResp;
    /* owner -------------------------------------------------- */
    const owner = root.resUserNm?.trim?.() ?? '';
    /* liens -------------------------------------------------- */
    const entries = root.resRegisterEntriesList?.flat?.() ?? [];
    const liens = entries
        .filter((e) => e.resType?.includes('근저당'))
        .map((e, idx) => ({
        rank: idx + 1,
        creditor: e.resContentsList?.[0]?.resContents ?? '',
        amt: e.resContentsList?.[1]?.resContents ?? '',
    }));
    /* leaseholds --------------------------------------------- */
    const leasesRaw = root.resLeaseholdsList?.flat?.() ?? [];
    const leaseholds = leasesRaw.map((e) => {
        const tenantLine = e.resContentsList?.[0]?.resContents ?? '';
        const depositLine = e.resContentsList?.[1]?.resContents ?? '';
        const termLine = e.resContentsList?.[2]?.resContents ?? '';
        const deposit = Number(depositLine.replace(/[^0-9]/g, ''));
        const [, from, to] = termLine.match(/(\d{4}-\d{2}-\d{2}).*?(\d{4}-\d{2}-\d{2})/) || [];
        return {
            tenant: tenantLine.replace(/^세입자\s*/, '').trim(),
            deposit,
            term: { from, to },
        };
    });
    /* auction ------------------------------------------------ */
    const auction = String(root.resState ?? '').includes('경매');
    return { owner, liens, leaseholds, auction };
}
