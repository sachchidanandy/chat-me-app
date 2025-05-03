import fs from 'fs';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuidv4 } from 'uuid';
import { S3Client } from '@aws-sdk/client-s3';

type handleFileUploadReturnType = {
  upload: Upload;
  fileKey: string;
};

// AWS S3 Configuration
export const s3 = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export const handleFileUpload = (file: Express.Multer.File, fileId: string = uuidv4()): handleFileUploadReturnType => {
  const fileKey = `uploads/${fileId}-${file.originalname}`;

  const fileStream = fs.createReadStream(file.path); // Read file as stream
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
      Body: fileStream,
      ContentType: file.mimetype,
    },
    queueSize: 6, // Parallel chunk uploads
    partSize: 5 * 1024 * 1024, // 5MB chunk size
  });

  return { upload, fileKey };
};
