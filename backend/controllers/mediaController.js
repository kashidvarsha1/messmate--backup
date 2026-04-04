import Media from '../models/Media.js';
import Provider from '../models/Provider.js';
import User from '../models/User.js';
import HygieneScoreService from '../services/hygieneScoreService.js';
import { validateImage } from '../utils/imageValidator.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

// Upload media (user/owner)
export const uploadMedia = catchAsync(async (req, res) => {
  const { providerId, type, caption, imageUrl } = req.body;

  // Validate provider
  const provider = await Provider.findById(providerId);
  if (!provider) {
    throw new AppError('Provider not found', 404);
  }

  // Basic image validation (prevent fake images)
  const validation = await validateImage(imageUrl);
  if (!validation.valid) {
    throw new AppError(`Image validation failed: ${validation.reason}`, 400);
  }

  // Create media record
  const media = await Media.create({
    userId: req.user.id,
    providerId,
    type,
    url: imageUrl,
    caption,
    metadata: validation.metadata,
    verified: req.user.role === 'admin' // Auto-verify for admin
  });

  // Update provider stats
  provider.totalMedia += 1;
  if (media.verified) provider.verifiedMedia += 1;
  await provider.save();

  // Update hygiene score
  await HygieneScoreService.updateHygieneScore(providerId);

  res.status(201).json({
    success: true,
    data: media,
    message: media.verified ? 'Image uploaded and verified!' : 'Image uploaded, pending verification'
  });
});

// Get verified media for a provider (public)
export const getProviderMedia = catchAsync(async (req, res) => {
  const { providerId } = req.params;
  const { type, verified = true } = req.query;

  let query = { providerId, isActive: true };
  if (verified === 'true') query.verified = true;
  if (type) query.type = type;

  const media = await Media.find(query)
    .populate('userId', 'name')
    .sort('-createdAt')
    .limit(20);

  res.status(200).json({
    success: true,
    count: media.length,
    data: media
  });
});

// Verify media (admin only)
export const verifyMedia = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'admin') {
    throw new AppError('Only admins can verify media', 403);
  }

  const media = await Media.findById(id);
  if (!media) {
    throw new AppError('Media not found', 404);
  }

  media.verified = true;
  media.verifiedBy = req.user.id;
  media.verifiedAt = new Date();
  await media.save();

  // Update provider stats
  const provider = await Provider.findById(media.providerId);
  if (provider) {
    provider.verifiedMedia += 1;
    await provider.save();
    await HygieneScoreService.updateHygieneScore(provider._id);
  }

  res.status(200).json({
    success: true,
    data: media,
    message: 'Media verified successfully'
  });
});

// Flag media as suspicious
export const flagMedia = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const media = await Media.findById(id);
  if (!media) {
    throw new AppError('Media not found', 404);
  }

  media.flags.push({
    reason,
    reportedBy: req.user.id,
    reportedAt: new Date()
  });
  await media.save();

  res.status(200).json({
    success: true,
    message: 'Media flagged for review'
  });
});

// Delete media
export const deleteMedia = catchAsync(async (req, res) => {
  const { id } = req.params;

  const media = await Media.findById(id);
  if (!media) {
    throw new AppError('Media not found', 404);
  }

  // Check permissions
  if (media.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  media.isActive = false;
  await media.save();

  // Update provider stats
  const provider = await Provider.findById(media.providerId);
  if (provider) {
    provider.totalMedia = Math.max(0, provider.totalMedia - 1);
    if (media.verified) provider.verifiedMedia = Math.max(0, provider.verifiedMedia - 1);
    await provider.save();
    await HygieneScoreService.updateHygieneScore(provider._id);
  }

  res.status(200).json({
    success: true,
    message: 'Media deleted successfully'
  });
});


