import { Schema, model, Types, Document } from 'mongoose';
import {boolean} from "hardhat/internal/core/params/argumentTypes";

/* ───────── 타입 정의 ───────── */
export type ContractDocState =
  | 'draft'      // 초안만 작성
  | 'pending'    // PDF 생성·참가자 초대 완료, 서명 대기
  | 'signed'     // 전원 서명 완료
  | 'cancelled'; // 임의 취소

export type AfterSignedContractState=
  | 'disputed'
  | 'Unilateral terminated'
  | 'Mutual terminated'
  | 'expired'
  | 'onGoing';

export type ParticipantRole = 'tenant' | 'landlord';

export interface Participant {
  _id: Types.ObjectId;        // mongoose 자동 생성
  email: string;
  name: string;
  phoneNum: string;
  role: ParticipantRole;

  /* PASS 본인확인 */
  verified: boolean;
  ciHash?: string;                // PASS CI (선택)

  /* 전자서명 */
  signedAt?: Date | null;     // 서명 시각
  tokenUsed: boolean;         // 재사용 방지 토큰
}

export interface ContractDoc extends Document {
  property : Types.ObjectId;
  agent    : Types.ObjectId;

  state    : ContractDocState;
  afterSignedState? :  AfterSignedContractState; // 서명 이후 계약에 대한 속성
  hasProblem? : boolean;
  pdfPath? : string;          // 초안 단계에서는 아직 없음

  finance  : {
    deposit : number;
    payment : number;
    perMonth: boolean;
  };
  period   : {
    start: Date;
    end  : Date;
  };
  participants: Participant[];
}

/* ───────── 서브 스키마 ───────── */
const participantSchema = new Schema<Participant>(
  {
    email:     { type: String, required: true },
    name:      { type: String, default: '' },
    phoneNum:  { type: String, default: '' },
    role:      { type: String, enum: ['tenant', 'landlord'], required: true },

    verified:  { type: Boolean, default: false },
    ciHash:    { type: String },

    signedAt:  { type: Date, default: null },
    tokenUsed: { type: Boolean, default: false },
  },
  { _id: true },
);

/* ───────── 메인 스키마 ───────── */
const contractSchema = new Schema<ContractDoc>(
  {
    property: { type: Schema.Types.ObjectId, ref: 'properties', required: true },
    agent:    { type: Schema.Types.ObjectId, ref: 'agents',     required: true },

    state:   { type: String, enum: ['draft', 'pending', 'signed', 'cancelled'], default: 'draft' },
    pdfPath: { type: String },          // 초안 단계에서는 비어 있을 수 있음

    afterSignedState: {type: String, enum:
            ['disputed','Unilateral terminated','Mutual terminated'
            , 'expired','onGoing']},
    hasProblem: {type:boolean, default:false},
    finance: {
      deposit : { type: Number, required: true },
      payment : { type: Number, required: true },
      perMonth: { type: Boolean, required: true },
    },
    period: {
      start: { type: Date, required: true },
      end:   { type: Date, required: true },
    },

    participants: [participantSchema],
  },
  { timestamps: true },
);

export const Contract = model<ContractDoc>('contracts', contractSchema);
