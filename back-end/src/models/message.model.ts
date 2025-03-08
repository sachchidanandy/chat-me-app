import { Schema, model } from 'mongoose';

export type MessageStatus = "sent" | "delivered" | "seen";

export interface iUploadFileMetaData {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
  expiredAt: Date;
  iv: string;
}
export interface IMessage {
  sender_id: Schema.Types.ObjectId;
  recipient_id: Schema.Types.ObjectId;
  cipher_text: string;
  nonce: string;
  attachment?: iUploadFileMetaData;
  timestamp: Date;
  status: MessageStatus;
}

const messageSchema = new Schema({
  sender_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  recipient_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cipher_text: { type: String, required: true },
  nonce: { type: String, required: true },
  attachment: {
    fileUrl: { type: String },
    fileName: { type: String },
    fileSize: { type: Number },
    fileType: { type: String },
    uploadedAt: { type: Date },
    expiredAt: { type: Date },
    iv: { type: String },
  },
  status: { type: String, enum: ["sent", "delivered", "seen"] },
  timestamp: { type: Date, default: Date.now },
});

// create a index to support find by sender_id and recipient_id and order by timestamp
messageSchema.index({ sender_id: 1, recipient_id: 1, timestamp: -1 });

const Message = model<IMessage>("Message", messageSchema);
export default Message;
