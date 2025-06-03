import { Schema, model, Types, Document } from 'mongoose';

export interface IRegistry extends Document {
  property: Types.ObjectId;          // properties._id
  rawXml: string;                    // 원문(XML) 그대로 저장
  hash: string;                      // SHA-256(원문)
  fetchedAt: Date;                   // 수집 시간
}

const RegistrySchema = new Schema<IRegistry>({
  property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  rawXml:   { type: String, required: true },
  hash:     { type: String, required: true, index: true },
  fetchedAt:{ type: Date,   default: Date.now }
});

export const Registry = model<IRegistry>('Registry', RegistrySchema);
