import dotenv from 'dotenv';

dotenv.config();

export const MONGODB_URI = process.env.MONGODB_URI || '';
export const PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET || '';
export const CORS_ALLOWED_DOMAIN = process.env.CORS_ALLOWED_DOMAIN || 'http://localhost:5173'
