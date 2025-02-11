import { Schema, model } from 'mongoose';

export enum eStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export interface iFriendRequest {
  sender_id: Schema.Types.ObjectId,
  reciever_id: Schema.Types.ObjectId,
  status: eStatus,
  createdAt: Date,
}

const friendRequestSchema = new Schema<iFriendRequest>({
  sender_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    require: true,
  },
  reciever_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: [eStatus.ACCEPTED, eStatus.PENDING, eStatus.REJECTED],
    default: eStatus.PENDING,
  },
  createdAt: { type: Date, default: Date.now }
});

const FriendRequest = model('FriendRequest', friendRequestSchema);

export default FriendRequest;
