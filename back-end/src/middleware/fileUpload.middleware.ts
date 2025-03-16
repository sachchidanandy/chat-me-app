import { NextFunction, Request, Response } from "express";
import multer from "multer";

import { tryCatchWrapper } from "@utils/wrapper";

const allowedMimeTypes = [
  "application/pdf", // .pdf
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "text/plain", // .txt
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "image/*", // All images
  "video/*", // All videos
  "audio/webm",
];

// Multer Storage (Use Disk Instead of Memory to Reduce RAM Usage)
const upload = multer({
  dest: "uploads/", // Stores file in "uploads/" folder
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req: Request, file: Express.Multer.File, cb) => {
    if (!allowedMimeTypes.some((type) => file.mimetype.match(type))) {
      return cb(new Error(`Invalid file type. Allowed types: images, videos, PDFs, DOCs, TXTs, PPTs, XLSs. But Recieved : ${file.mimetype}`));
    }
    cb(null, true);
  },
});

export default tryCatchWrapper(async (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err: unknown | null) => {
    if (err) {
      return next(err);
    }
    next();
  });
});
