import axios from 'axios';
import crypto from 'crypto';

export const validateImage = async (imageUrl) => {
  try {
    // Download image for analysis
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 10000 });
    const buffer = Buffer.from(response.data);
    
    // Check file size (max 5MB)
    if (buffer.length > 5 * 1024 * 1024) {
      return { valid: false, reason: 'Image too large (max 5MB)' };
    }
    
    // Detect image format from magic numbers
    const magicNumbers = buffer.toString('hex', 0, 4);
    const validFormats = {
      'ffd8ffe0': 'jpeg',
      'ffd8ffe1': 'jpeg',
      '89504e47': 'png',
      '47494638': 'gif',
      '52494646': 'webp'
    };
    
    const format = validFormats[magicNumbers];
    if (!format) {
      return { valid: false, reason: 'Invalid image format' };
    }
    
    // Basic metadata extraction
    const metadata = {
      size: buffer.length,
      format: format,
      hash: crypto.createHash('sha256').update(buffer).digest('hex')
    };
    
    // Check for duplicate images (basic)
    // This would require storing hashes in database
    
    return { valid: true, metadata };
    
  } catch (error) {
    console.error('Image validation error:', error);
    return { valid: false, reason: 'Unable to process image' };
  }
};

// Additional validation for fake detection
export const checkImageMetadata = async (imageUrl) => {
  // This would integrate with EXIF data extraction
  // Check for:
  // - Timestamp mismatch
  // - GPS data
  // - Edited vs original
  // - Stock photo detection
  return { isAuthentic: true, confidence: 0.85 };
};