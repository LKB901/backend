import { Schema, model, Types, Document } from 'mongoose';
import { ThePartiesDoc } from './theParties.model';

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
    addressBasic: string;
    rentDetailPart: string; // 임차할 상세 부분
    building:{
        structureAndPurpose:string,
        space: number
    };
    land: {
        purpose: string,
        space: number
    };
    space: number;
    uniqueNo: string;
    landlord: Types.ObjectId | ThePartiesDoc;
    subsEmail: string[];
    subsPhone: string[];
    snapshots: Snapshot[];
}

export interface PropertyDoc extends Document, PropertyAttrs {
  _id: Types.ObjectId;        // ← _id 타입 명시
}


const propertySchema = new Schema<PropertyDoc>(
  {
    addressBasic: { type: String, required: true },
    rentDetailPart: String,
    space: { type: Number, required: true },
    uniqueNo: { type: String, index: true, required: true },

    /* 임대인 정보 */
    landlord: { type: Schema.Types.ObjectId, ref: 'TheParties', required: true },

    building:    {
        structureAndPurpose:String,
        space: Number
    },

    land:{
        purpose: String,
        space: Number
    },
    /* 스냅샷 */
    snapshots: { type: [snapshotSchema], default: [] },
  },
  { timestamps: true }
);

/* ── 모델 내보내기 ───────────────────────────────── */
export const Property = model<PropertyDoc>('Property', propertySchema);
