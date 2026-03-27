import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FILE_UPLOAD } from './constants';
import logger from './logger';

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, FILE_UPLOAD.DESTINATION);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  },
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (FILE_UPLOAD.ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

// Create multer upload instance
export const upload = multer({
  storage,
  limits: {
    fileSize: FILE_UPLOAD.MAX_SIZE,
  },
  fileFilter,
});

// Upload to S3 (placeholder - implement based on your S3 setup)
export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
  // Implement S3 upload logic here
  // This is a placeholder that returns a local URL
  const fileUrl = `/uploads/${file.filename}`;
  logger.info(`File uploaded: ${file.originalname} -> ${fileUrl}`);
  return fileUrl;
};

// Delete file from storage
export const deleteFile = async (filePath: string): Promise<void> => {
  // Implement file deletion logic here
  logger.info(`File deleted: ${filePath}`);
};

// Get file URL
export const getFileUrl = (filename: string): string => {
  return `${process.env.APP_URL || 'http://localhost:3000'}/uploads/${filename}`;
};

export default {
  upload,
  uploadToS3,
  deleteFile,
  getFileUrl,
};
