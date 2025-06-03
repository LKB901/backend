import { Schema, model, Types } from 'mongoose';

const listingSchema = new Schema({
  property: { type: Types.ObjectId, ref: 'Property', required: true },
  landlord: { type: Types.ObjectId, ref: 'User',    required: true },
  agent:    { type: Types.ObjectId, ref: 'Agent',   required: true },
  status:   { type: String, enum: ['PENDING','ACCEPTED','REJECTED'], default: 'PENDING' },
  createdAt:{ type: Date, default: Date.now }
});
listingSchema.index({ agent: 1, status: 1 });

export const Listing = model('Listing', listingSchema);
