"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerTx = void 0;
const mongoose_1 = require("mongoose");
const ledgerTxSchema = new mongoose_1.Schema({
    contract: { type: mongoose_1.Types.ObjectId, ref: 'Contract', required: true },
    network: String,
    txHash: String,
    blockNo: Number,
    sealedAt: { type: Date, default: Date.now }
});
ledgerTxSchema.index({ contract: 1 });
exports.LedgerTx = (0, mongoose_1.model)('LedgerTx', ledgerTxSchema);
