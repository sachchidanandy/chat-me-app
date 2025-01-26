import { Schema, model } from 'mongoose';

const MessageSchema = new Schema({
  sender_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  recipient_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cipher_text: { type: String, required: true },
  nonce: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// create a index to support find by sender_id and recipient_id and order by timestamp
MessageSchema.index({ sender_id: 1, recipient_id: 1, timestamp: -1 });

module.exports = model('Message', MessageSchema);
