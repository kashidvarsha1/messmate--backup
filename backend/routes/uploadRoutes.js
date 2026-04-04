import express from 'express';
import upload from '../middleware/upload.js';
import { uploadImage, handleUploadError } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';
import { uploadLimiter } from '../config/rateLimit.js';

const router = express.Router();

router.post('/', protect, uploadLimiter, (req, res, next) => {
  upload.single('image')(req, res, (error) => {
    if (error) {
      return handleUploadError(error, req, res, next);
    }

    return uploadImage(req, res, next);
  });
});

export default router;
