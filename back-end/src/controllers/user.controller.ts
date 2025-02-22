import { SEARCH_QUERY_REQ } from '@constants/errorMessages';
import { BAD_REQUEST } from '@constants/statusCode';
import User from '@models/user.model';
import { searchUsersByName } from '@services/user.services';
import { ErrorResponse } from '@utils/errorResponse';
import { sendSuccessResponse } from '@utils/wrapper';
import { Request, Response } from 'express';

/**
 * Search users using Atlas Search
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @return {Promise<void>}
 */
export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  const { searchQuery } = req.params;
  const page = parseInt(req.query?.page as string) || 1;
  const limit = parseInt(req.query?.limit as string) || 10;
  const offset = (page - 1) * limit;
  const { userId } = req?.body;

  if (!searchQuery) {
    throw new ErrorResponse(SEARCH_QUERY_REQ, BAD_REQUEST);
  }

  const users = await searchUsersByName(userId, searchQuery, offset, limit);

  // Extract results
  const totalUsers = users[0].metadata[0]?.totalUsers || 0;
  const userList = users[0].paginatedResults;

  const response = {
    totalUsers,
    users: userList,
    currentPage: Math.floor(offset / limit) + 1,
    totalPages: Math.ceil(totalUsers / limit),
    message: totalUsers ? 'User fetched' : 'No user found',
  };

  sendSuccessResponse(res, response);
};

export const updateUsers = async () => {
  const users = await User.find();

  users.forEach(async ({ email, _id }) => {
    const fullName = email.split('.').slice(0, 2).join(' ').slice(0, -2);
    await User.findByIdAndUpdate(_id, { full_name: fullName });
  });
};

