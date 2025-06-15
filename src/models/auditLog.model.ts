import { Schema, model, Types, Document } from 'mongoose';

export type AuditAction =
  | 'created'
  | 'written'
  | 'update'
  | 'signed'
  | 'executed';

export interface AuditLogDoc extends Document {
  contract: Types.ObjectId;
  action: AuditAction;
  participant?: Types.ObjectId;
  timestamp: Date;
}

const auditSchema = new Schema<AuditLogDoc>(
  {
    contract:    { type: Schema.Types.ObjectId, ref: 'contracts', required: true },
    action:      { type: String, enum: ['created','written','update','signed','dispute','terminate'], required: true },
    participant: { type: Schema.Types.ObjectId },
    timestamp:   { type: Date, default: () => new Date() }
  },
  { versionKey: false }
);

export const AuditLog = model<AuditLogDoc>('auditlogs', auditSchema);
