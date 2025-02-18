import { model, Schema } from "mongoose";

const lastChatSchema = new Schema({
  user_one: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  user_two: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  last_chat: { type: Schema.Types.ObjectId, ref: 'Message', required: true },
  last_chat_timestamp: { type: Date, default: Date.now },
});

// Add index on last_chat in decending order
lastChatSchema.index({ user_one: 1, user_two: 1, last_chat_timestamp: -1 });

const LastChat = model('LastChat', lastChatSchema);
export default LastChat;