import { Schema, model, Types } from 'mongoose';

const ledgerTxSchema = new Schema({
  contract: { type: Types.ObjectId, ref: 'Contract', required: true },
  network:  String,
  txHash:   String,
  blockNo:  Number,
  sealedAt: { type: Date, default: Date.now }
});
ledgerTxSchema.index({ contract: 1 });

export const LedgerTx = model('LedgerTx', ledgerTxSchema);
