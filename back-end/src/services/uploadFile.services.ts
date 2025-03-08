import fs from 'fs';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuidv4 } from 'uuid';

import { AWS_S3_BUCKET_NAME, s3 } from '@utils/config';

type handleFileUploadReturnType = {
  upload: Upload;
  fileKey: string;
};
export const handleFileUpload = (file: Express.Multer.File, fileId: string = uuidv4()): handleFileUploadReturnType => {
  const fileKey = `uploads/${fileId}-${file.originalname}`;

  const fileStream = fs.createReadStream(file.path); // Read file as stream
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: AWS_S3_BUCKET_NAME,
      Key: fileKey,
      Body: fileStream,
      ContentType: file.mimetype,
    },
    queueSize: 6, // Parallel chunk uploads
    partSize: 5 * 1024 * 1024, // 5MB chunk size
  });

  return { upload, fileKey };
};
