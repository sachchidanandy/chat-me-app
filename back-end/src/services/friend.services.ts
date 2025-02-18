import { Types } from "mongoose";
import FriendRequest, { eStatus, iFriendRequest } from "@models/friendRequest.model";
import Friends from "@models/friends.model";

export const getIsAlreadyFriend = async (userId: string, receiverId: string) => {
  const isFriend = await Friends.findOne({
    user_id: userId,
    friends_list: { $in: [receiverId] }
  });

  return isFriend ? true : false; // Returns true if receiverId is NOT in friends_list
};

export const getAlreadySendRequest = async (userId: string, receiverId: string): Promise<iFriendRequest | null> => {
  const friendRequest = await FriendRequest.findOne({
    sender_id: userId,
    reciever_id: receiverId,
    status: eStatus.PENDING,
  }).populate('reciever_id', 'full_name');

  return friendRequest;
};

export const fetchPendingRequest = async (userId: string) => {
  const pendingRequest = await FriendRequest.aggregate([
    {
      $match: { reciever_id: new Types.ObjectId(userId), status: eStatus.PENDING }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'sender_id',
        foreignField: '_id',
        as: 'sendersDetail'
      }
    },
    {
      $project: {
        _id: 0,
        requestId: '$_id',
        senderName: { $arrayElemAt: ['$sendersDetail.full_name', 0] },
        senderUsername: { $arrayElemAt: ['$sendersDetail.username', 0] },
        senderProfilePic: { $arrayElemAt: ['$sendersDetail.profile_pic_url', 0] },
        sentAt: '$createdAt'
      }
    }
  ]);

  return pendingRequest;
}
