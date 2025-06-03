import { Schema, model, Types, Document } from 'mongoose';

export interface IRegistryEvent extends Document {
  property: Types.ObjectId;
  prevHash: string;
  newHash: string;
  diff: string;          // JSON.stringify(diff) 결과
  detectedAt: Date;
}

const RegistryEventSchema = new Schema<IRegistryEvent>({
  property:  { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  prevHash:  { type: String, required: true },
  newHash:   { type: String, required: true },
  diff:      { type: String, required: true },
  detectedAt:{ type: Date, default: Date.now }
});

export const RegistryEvent =
  model<IRegistryEvent>('RegistryEvent', RegistryEventSchema);
