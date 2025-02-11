import { SEARCH_QUERY_REQ } from '@constants/errorMessages';
import { BAD_REQUEST } from '@constants/statusCode';
import Friends from '@models/friends.model';
import User from '@models/user.model';
import { ErrorResponse } from '@utils/errorResponse';
import { sendSuccessResponse } from '@utils/wrapper';
import { Request, Response } from 'express';


export const searchUsers = async (req: Request, res: Response) => {
  const { searchQuery } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.params?.limit) || 10;
  const offset = (page - 1) * limit;
  const { userId } = req?.body;

  // Step 1: Find the user's friends
  const userFriends = await Friends.findOne({ user_id: userId }).select("friends_list.friend_id");
  const friendIds = userFriends ? userFriends.friends_list.map(f => f.friend_id) : [];


  if (!searchQuery) {
    throw new ErrorResponse(SEARCH_QUERY_REQ, BAD_REQUEST);
  }

  const users = await User.aggregate([
    {
      $search: {
        index: 'search_users',
        compound: {
          should: [
            {
              autocomplete: {
                query: searchQuery,
                path: "full_name", // Search in full_name
                fuzzy: {
                  maxEdits: 2,
                },
              },
            },
            {
              autocomplete: {
                query: searchQuery,
                path: "username", // Search in username
                fuzzy: {
                  maxEdits: 2,
                },
              },
            },
          ],
        },
      }
    },
    {
      $match: {
        _id: { $nin: friendIds, $ne: userId }
      }
    },
    { $skip: offset },
    { $limit: limit },
    {
      $lookup: {
        from: 'FriendRequest',
        let: { searchedUserId: "$_id", currentUserId: userId },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$sender_id", "$$currentUserId"] }, // Request sent by logged-in user
                  { $eq: ["$receiver_id", "$$searchedUserId"] }, // Request received by searched user
                  { $eq: ["$status", "pending"] } // Pending requests only
                ]
              }
            }
          },
          { $project: { _id: 1 } }
        ],
        as: "friendRequest"
      }
    },
    {
      $addFields: {
        isRequestSent: { $gt: [{ $size: "$friendRequest" }, 0] } // Convert array to boolean
      }
    },
    {
      $project: {
        id: '$_id',
        fullName: '$full_name',
        profilePicUrl: '$profile_pic_url',
        username: 1,
        isRequestSent: 1,
        _id: 0,
      }
    },
  ]);

  const message = users.length ? 'User fetched' : 'No user found';
  return sendSuccessResponse(res, { users, message });
};