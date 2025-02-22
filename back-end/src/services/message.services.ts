import Message from "@models/message.model";

export const fetchUserMessages = async (userId: string, friendsId: string, offset: number, limit: number) => {
  const messages = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender_id: userId, recipient_id: friendsId },
          { sender_id: friendsId, recipient_id: userId }
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