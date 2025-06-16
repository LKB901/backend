import { Schema, model, Types, Document } from 'mongoose';
import { PropertyDoc } from './property.model';

/* ── 경고 타입 열거 ─────────────────────────────── */
export type AlertType =
  | 'OWNER_CHANGE'
  | 'LIEN_ADD'
  | 'LIEN_EDIT'
  | 'LIEN_REMOVE'
  | 'AUCTION_START'
  | 'AUCTION_END'
  | 'LEASE_ADD'  
  | 'LEASE_EDIT'  
  | 'LEASE_REMOVE';

/* ── 인터페이스 정의 ─────────────────────────────── */
interface AlertAttrs {
  property: Types.ObjectId | PropertyDoc;   // populate 가능성 명시
  type: AlertType;
  diff: unknown;                            // deep-diff 결과
  sent?: boolean;
  diffHash: string;                         // diff idempotency check
  /** PDF 메타데이터 */
  pdf: {
    s3Key: string;                          // S3·로컬 key
    hash : string;                          // SHA-256 등
  };
  pdfPath: string;
  createdAt?: Date;
}

export interface AlertDoc extends Document, AlertAttrs {}

/* ── 스키마 ─────────────────────────────────────── */
const alertSchema = new Schema<AlertDoc>(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },

    type: {
      type: String,
      required: true,
      enum: [
        'OWNER_CHANGE',
        'LIEN_ADD',
        'LIEN_EDIT',
        'LIEN_REMOVE',
        'AUCTION_START',
        'AUCTION_END',
        'LEASE_ADD',
        'LEASE_EDIT',
        'LEASE_REMOVE',
        
      ],
    },

    diff: Schema.Types.Mixed,

    sent:     { type: Boolean, default: false },
    diffHash: { type: String, index: true, unique: true },

    /** pdf → 서브도큐먼트 */
    pdf: {
      s3Key: { type: String, required: true },
      hash : { type: String, required: true },
    },

    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

/* ── 모델 ───────────────────────────────────────── */
export const Alert = model<AlertDoc>('Alert', alertSchema);
