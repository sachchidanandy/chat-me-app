import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

export const MONGODB_URI = process.env.MONGODB_URI || '';
export const PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET || '';
export const CORS_ALLOWED_DOMAIN = process.env.CORS_ALLOWED_DOMAIN || 'http://localhost:5173'
export const REDIS_URL = process.env.REDIS_URL || '';
export const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

// AWS S3 Configuration
export const s3 = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});
