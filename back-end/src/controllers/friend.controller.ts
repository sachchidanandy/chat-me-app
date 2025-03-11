import { ALREADY_A_FRIEND, ALREADY_SENT_REQUEST, NO_REQUEST_FOUND, NO_FRIEND_FOUND, SEARCH_QUERY_REQ } from "@constants/errorMessages";
import { BAD_REQUEST, CREATED } from "@constants/statusCode";
import FriendRequest, { eStatus } from "@models/friendRequest.model";
import Friends from "@models/friends.model";
import { getAlreadySendRequest, fetchPendingRequest, getIsAlreadyFriend } from "@services/friend.services";
import { ErrorResponse } from "@utils/errorResponse";
import { sendSuccessResponse } from "@utils/wrapper";
import { Request, Response } from "express";
import { Types } from "mongoose";


export const getAllFriends = async (req: Request, res: Response) => {
  const { userId } = req.body;

  const friends = await Friends.aggregate([
    {
      $match: { user_id: new Types.ObjectId(userId as string) }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'friends_list',
        foreignField: '_id',
        as: 'friendsDetails'
      }
    },
    {
      $project: {
        _id: 0,
        friendsDetail: {
          $map: {
            input: "$friendsDetails",
            as: "friend",
            in: [{ $toString: "$$friend._id" }, "$$friend.pub_key"]
          }
        }
      }
    }
  ]);

  const message = friends.length ? 'Friends fetched' : 'No friends found';
  const friendsObject = friends.length ? friends[0]?.friendsDetail : [];
  return sendSuccessResponse(res, { friendsKeyMap: friendsObject, message });
};

export const getAllFriendRequest = async (req: Request, res: Response) => {
  const { userId } = req.body;

  const pendingRequests = await fetchPendingRequest(userId);
  const message = pendingRequests?.length ? 'Friend Request List' : NO_REQUEST_FOUND;

  sendSuccessResponse(res, { pendingRequests, message });
};

export const sendRequest = async (req: Request, res: Response) => {
  const { recieversId, userId } = req.body;

  // Check if request is already sent
  const isAlreadySendRequest = await getAlreadySendRequest(userId, recieversId);
  if (isAlreadySendRequest) {
    const { createdAt, reciever_id } = isAlreadySendRequest;
    const { full_name } = reciever_id as unknown as { full_name: string };
    throw new ErrorResponse(ALREADY_SENT_REQUEST(full_name, createdAt), BAD_REQUEST);
  }

  // Check if recieverId is not already friend
  const isAlreadyFriend = await getIsAlreadyFriend(userId, recieversId);
  if (isAlreadyFriend) {
    throw new ErrorResponse(ALREADY_A_FRIEND, BAD_REQUEST);
  }

  // Send friend request
  await new FriendRequest({ reciever_id: recieversId, sender_id: userId }).save();
  return sendSuccessResponse(res, { message: 'Friend request sent successfully!' }, CREATED);
};

export const acknowledgeRequest = async (req: Request, res: Response) => {
  const { requestId, userId, accepted } = req.body;
  const updatedState = accepted ? eStatus.ACCEPTED : eStatus.REJECTED;

  // Change status to accepted
  const friendRequest = await FriendRequest.findOneAndUpdate(
    { _id: requestId, reciever_id: userId, status: eStatus.PENDING },
    { $set: { status: updatedState } },
    { new: true }
  );

  if (!friendRequest) {
    throw new ErrorResponse(NO_REQUEST_FOUND, BAD_REQUEST);
  }

  // Add to each others friend list
  if (accepted) {
    const options = { upsert: true };
    // Add sender to current loged-in user's friends list
    await Friends.findOneAndUpdate({ user_id: userId }, {
      $addToSet: {
        friends_list: friendRequest?.sender_id
      }
    }, options);

    // Add current user to senders friends list
    await Friends.findOneAndUpdate({ user_id: friendRequest?.sender_id }, {
      $addToSet: {
        friends_list: userId
      }
    }, options);
  }

  return sendSuccessResponse(res, { message: `Friend request ${updatedState} successfully!` });
};

export const fetchSpecificFriendDetail = async (req: Request, res: Response) => {
  const { userId } = req.body;
  const { id } = req.query;

  if (!id) {
    throw new ErrorResponse(SEARCH_QUERY_REQ, BAD_REQUEST);
  }

  const friendDetail = await Friends.aggregate([
    {
      $match: {
        user_id: new Types.ObjectId(userId as string),
        friends_list: new Types.ObjectId(id as string)
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'friends_list',
        foreignField: '_id',
        as: 'friendsDetails'
      }
    },
    {
      $unwind: '$friendsDetails'
    },
    {
      $match: {
        'friendsDetails._id': new Types.ObjectId(id as string)
      }
    },
    {
      $replaceRoot: {
        newRoot: '$friendsDetails'
      }
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        name: '$full_name',
        pubKey: '$pub_key',
        profilePicUrl: '$profile_pic_url'
      }
    }
  ]);

  if (!friendDetail) {
    throw new ErrorResponse(NO_FRIEND_FOUND, BAD_REQUEST);
  }

  return sendSuccessResponse(res, { friendDetail });
}
