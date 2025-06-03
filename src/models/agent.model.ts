import { Schema, model, Document } from 'mongoose';

export interface AgentDoc extends Document {
  name: string;
  phoneNum: string;
  email: string;
  pwHash: string;
  brokerNo: string;
  idImage: string;
  approved: boolean;
}

const agentSchema = new Schema<AgentDoc>(
  {
    name:       { type: String, required: true },
    phoneNum:   { type: String, required: true, unique: true },
    email:      { type: String, required: true, unique: true },
    pwHash:     { type: String, required: true },
    brokerNo:   { type: String, required: true },
    idImage:    { type: String, required: true },
    approved:   { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Agent = model<AgentDoc>('agents', agentSchema);
