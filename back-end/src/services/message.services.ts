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
        nonce: '$nonce',
        attachment: '$attachment'
      }
    }
  ]);
  return messages;
};

export const fetchUserChatList = async (userId: string) => {
  const lastChatList = await Message.aggregate([
    // Fetch list of all messages of current user
    {
      $match: {
        $or: [
          { sender_id: new Types.ObjectId(userId) },
          { recipient_id: new Types.ObjectId(userId) }
        ]
      }
    },
    // Add a fields called friend_id to each message
    {
      $addFields: {
        friend_id: {
          $cond: {
            if: { $eq: ["$sender_id", new Types.ObjectId(userId)] },
            then: "$recipient_id",
            else: "$sender_id"
          }
        }
      }
    },
    // Group all messages by friend_id and populate only last message
    {
      $group: {
        _id: '$friend_id',
        lastMessage: { $last: '$$ROOT' }
      }
    },
    // Lookup friend details
    {
      $lookup: {
        from: "users",
        localField: "lastMessage.friend_id",
        foreignField: "_id",
        as: "friend_Detail",
        pipeline: [
          { $limit: 1 }
        ]
      }
    },
    // Convert array to object
    {
      $unwind: "$friend_Detail"
    },
    // Select required fields
    {
      $project: {
        _id: 0,
        id: "$friend_Detail._id",
        name: "$friend_Detail.full_name",
        pubKey: "$friend_Detail.pub_key",
        profilePicUrl: "$friend_Detail.profile_pic_url",
        lastMessage: {
          cipherText: "$lastMessage.cipher_text",
          nonce: "$lastMessage.nonce",
          timestamp: "$lastMessage.timestamp"
        },
      }
    },
    // Sort by last message timestamp
    {
      $sort: {
        "lastMessage.timestamp": -1
      }
    }
  ]);

  return lastChatList;
};
