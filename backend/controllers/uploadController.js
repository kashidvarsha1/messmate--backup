import multer from 'multer';

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload.',
      });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    return res.status(201).json({
      success: true,
      message: 'Image uploaded successfully.',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: imageUrl,
      },
      url: imageUrl,
    });
  } catch (error) {
    console.error('Upload controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while uploading the image.',
    });
  }
};

export const handleUploadError = (error, req, res, next) => {
  if (!error) {
    return next();
  }

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Image must be 5MB or smaller.',
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Only JPG, JPEG, PNG, GIF, and WEBP image files are allowed.',
    });
  }

  return res.status(400).json({
    success: false,
    message: error.message || 'Invalid upload request.',
  });
};
