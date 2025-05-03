import jwt from 'jsonwebtoken';

const generateToken = (id: string) => {
  return jwt.sign({ user_id: id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string);
  } catch (error) {
    console.log("Error while verify token", error);
    return null;
  }
};

export { generateToken, verifyToken };

