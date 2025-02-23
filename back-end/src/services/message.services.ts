import Message from "@models/message.model";
import { Types } from "mongoose";

export const fetchUserMessages = async (userId: string, friendsId: string, offset: number, limit: number) => {
  const messages = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender_id: new Types.ObjectId(userId), recipient_id: new Types.ObjectId(friendsId) },
          { sender_id: new Types.ObjectId(friendsId), recipient_id: new Types.ObjectId(userId) }
        ]
      }
    },
    { $sort: { timestamp: -1 } },
    { $skip: offset },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        id: '$_id',
        senderId: '$sender_id',
        recipientId: '$recipient_id',
        timestamp: '$timestamp',
        status: '$status',
        cipherText: '$cipher_text',
        nonce: '$nonce'
      }
    }
  ]);
  return messages;
};