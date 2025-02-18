import User from '@models/user.model';
import { Schema, Types } from 'mongoose';

export const searchUsersByName = async (userId: string, searchQuery: string, offset: number, limit: number) => {
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
        _id: { $ne: new Types.ObjectId(userId) }
      }
    },
    { $skip: offset },
    { $limit: limit },
    {
      $lookup: {
        from: 'friends',
        let: { searchedUserId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$user_id", new Types.ObjectId(userId)]
                  },
                  { $in: ["$$searchedUserId", "$friends_list"] }
                ]
              }
            }
          },
          { $limit: 1 },
          { $project: { _id: 1 } }
        ],
        as: 'friendCheck'
      }
    },
    {
      $lookup: {
        from: "friendrequests",
        let: {
          searchedUserId: "$_id",
          currentUserId: new Types.ObjectId(userId),
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [
                      "$sender_id",
                      "$$currentUserId",
                    ],
                  },
                  {
                    $eq: [
                      "$reciever_id",
                      "$$searchedUserId",
                    ],
                  },
                  {
                    $eq: ["$status", "pending"],
                  },
                ],
              },
            },
          },
          { $limit: 1 },
          { $project: { _id: 1 } }
        ],
        as: "friendRequest",
      },
    },
    {
      $set: {
        isRequestSent: { $gt: [{ $size: "$friendRequest" }, 0] }, // Convert array to boolean
        isFriend: { $gt: [{ $size: "$friendCheck" }, 0] }, // Check if user is in friends_list
      }
    },
    {
      $project: {
        id: '$_id',
        fullName: '$full_name',
        profilePicUrl: '$profile_pic_url',
        username: 1,
        isRequestSent: 1,
        isFriend: 1,
        _id: 0,
      }
    },
    {
      $facet: {
        metadata: [{ $count: "totalUsers" }],
        paginatedResults: [{ $skip: offset }, { $limit: limit }]
      }
    }
  ]);

  return users;
};
