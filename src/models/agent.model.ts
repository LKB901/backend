import mongoose, {Schema, model, Document, Types} from 'mongoose';
import {Property} from '../models'
export interface AgentDoc extends Document {
  name: string;
  address: string;
  compName: string;
  phoneNum: string;
  brokerNo: string;
  email: string;
  pwHash: string;
  ciHash: string;
  idImage: string;
  approved: boolean;
  manageProperty?: Types.ObjectId[];
}

const agentSchema = new Schema<AgentDoc>(
  {
    name:       { type: String, required: true },
    address:    { type: String, required: true },
    compName:   { type: String, required: true },
    phoneNum:   { type: String, required: true, unique: true },
    email:      { type: String, required: true, unique: true },
    pwHash:     { type: String, required: true },
    brokerNo:   { type: String, required: true },
    idImage:    { type: String, required: true },
    ciHash:     { type: String, required: true },
    approved:   { type: Boolean, default: false },
    manageProperty: {type: mongoose.Schema.Types.ObjectId, ref:'Property' , default: [] }
  },
  { timestamps: true }
);

export const Agent = model<AgentDoc>('agents', agentSchema);
