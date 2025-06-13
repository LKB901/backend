// src/models/landlord.model.ts
import { Schema, model, Document } from 'mongoose';

export interface LandlordDoc extends Document {
  name   : string;
  phone ?: string;
  email ?: string;
  ciHash?: string;   // PASS mock-up CI 값
}

const landlordSchema = new Schema<LandlordDoc>(
  {
    name : { type: String, required: true },
    phone: String,
    email: String,
    ciHash: String,
  },
  { timestamps: true }
);

// 3번째 인자를 'landlords' 로 지정하면 기존 컬렉션과 바로 매칭됨
export const Landlord = model<LandlordDoc>('Landlord', landlordSchema, 'landlords');
