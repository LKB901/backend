// src/models/theParties.model.ts
import { Schema, model, Document } from 'mongoose';

export interface ThePartiesDoc extends Document {
  name   : string;
  phone  : string;
  email ?: string;
  ciHash?: string;   // PASS mock-up CI 값
}

const thePartiesSchema = new Schema<ThePartiesDoc>(
  {
    name : { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    ciHash: String,
  },
  { timestamps: true }
);

// 3번째 인자를 'landlords' 로 지정하면 기존 컬렉션과 바로 매칭됨
export const TheParties = model<ThePartiesDoc>('TheParties', thePartiesSchema,'theParties');
