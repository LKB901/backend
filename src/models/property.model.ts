import { Schema, model, Types, Document } from 'mongoose';
import { LandlordDoc } from './landlord.model';

/* ── 서브 도큐먼트: 등기 스냅샷 ───────────────────── */
interface Snapshot {
  fetchedAt: Date;
  rawXml: string;
  parsed: any;
  hash: string;
}

const snapshotSchema = new Schema<Snapshot>(
  {
    fetchedAt: { type: Date, default: Date.now },
    rawXml: String,
    parsed: Schema.Types.Mixed,
    hash: String,
  },
  { _id: false }
);

/* ── 메인 스키마 ─────────────────────────────────── */
interface PropertyAttrs {
  buildingName: string;
  addressBasic: string;
  addressDetail?: string;
  space: number;
  uniqueNo: string;
  landlord: Types.ObjectId | LandlordDoc;
  landlordName?: string;
  subsEmail: string[];
  subsPhone: string[];
  snapshots: Snapshot[];
}

export interface PropertyDoc extends Document, PropertyAttrs {
  _id: Types.ObjectId;        // ← _id 타입 명시
}

const propertySchema = new Schema<PropertyDoc>(
  {
    /* 기본 정보 */
    buildingName: { type: String, required: true },
    addressBasic: { type: String, required: true },
    addressDetail: String,
    space: { type: Number, required: true },
    uniqueNo: { type: String, index: true, required: true },

    /* 임대인 정보 */
    landlord: { type: Schema.Types.ObjectId, ref: 'Landlord', required: true },
    landlordName: String,

    /* 알림 구독 정보 */
    subsEmail: { type: [String], default: [] },
    subsPhone: { type: [String], default: [] },

    /* 스냅샷 */
    snapshots: { type: [snapshotSchema], default: [] },
  },
  { timestamps: true }
);

/* ── 모델 내보내기 ───────────────────────────────── */
export const Property = model<PropertyDoc>('Property', propertySchema);
