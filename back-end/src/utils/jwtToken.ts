import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config';

const generateToken = (id: string) => {
  return jwt.sign({ user_id: id }, JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET as string);
};

export { generateToken, verifyToken };

