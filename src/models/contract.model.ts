import { Schema, model, Types, Document } from 'mongoose';
import {boolean} from "hardhat/internal/core/params/argumentTypes";

/* ───────── 타입 정의 ───────── */
export type ContractDocState =
  | 'draft'      // 계약 문서 생성 완료 서명 대기.
  | 'signed'     // 전원 서명 완료
  | 'cancelled'; // 임의 취소

export type AfterSignedContractState=
  | 'disputed'
  | 'Unilateral_terminated'
  | 'Mutual_terminated'
  | 'expired'
  | 'onGoing';

export type LeaseKind =
    | 'lump_sum'
    | 'per_month'
    | 'per_month_with_depoist';

export type ContractType =
    | 'new'
    | 'renewal'
    | 're-sign'
export type ParticipantRole = 'tenant' | 'landlord' |'agent';

export interface signedInfo{
    role: ParticipantRole;
    /* 전자서명 */

    signedAt?: Date | null;     // 서명 시각
    tokenUsed: boolean;         // 재사용 방지 토큰
}

/* ───────── 서브 스키마 ───────── */
const signedInfoSchema = new Schema<signedInfo>(
    {
        role:      { type: String, enum: ['tenant', 'landlord','agent'], required: true },
        signedAt:  { type: Date, default: null},
        tokenUsed: { type: Boolean, default: false},
    },
    { _id: true },
);

export interface ContractDoc extends Document {
    property: Types.ObjectId;
    agent: Types.ObjectId;
    landLord: Types.ObjectId;
    contractType: ContractType;
    leaseKind: LeaseKind;

    tenant: Types.ObjectId;
    state: ContractDocState;
    afterSignedState?: AfterSignedContractState; // 서명 이후 계약에 대한 속성
    hasProblem?: boolean;

    pdfBase64?: string;
}


/* ───────── 메인 스키마 ───────── */
const contractSchema = new Schema<ContractDoc>(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    agent:    { type: Schema.Types.ObjectId, ref: 'agents',     required: true },
    landLord: { type: Schema.Types.ObjectId, ref:'TheParties', required: true},
    tenant: { type: Schema.Types.ObjectId, ref: 'TheParties', required:true},
    state:   { type: String, enum: ['draft', 'signed', 'cancelled'], default: 'draft' },
    pdfBase64: { type: String, default:null },          // 초안 단계에서는 비어 있을 수 있음



    afterSignedState: {type: String, enum:
            ['disputed','Unilateral_terminated','Mutual_terminated'
            , 'expired','onGoing']},

    hasProblem: {type:Boolean, default:false},
    finance: {
      deposit : { type: Number, required: true },
      payment : { type: Number, required: true },
      perMonth: { type: Boolean, required: true },
    },
    period: {
      start: { type: Date, required: true },
      end:   { type: Date, required: true },
    },
    signedInfo: [signedInfoSchema],
  },
  { timestamps: true },
);

export const Contract = model<ContractDoc>('contracts', contractSchema);
