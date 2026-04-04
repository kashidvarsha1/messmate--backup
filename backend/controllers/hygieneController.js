import HygieneProof from '../models/HygieneProof.js';
import Provider from '../models/Provider.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

export const uploadHygieneProof = catchAsync(async (req, res) => {
  const { providerId, imageUrl, type } = req.body;

  if (!providerId || !imageUrl) {
    throw new AppError('Provider ID and image URL are required', 400);
  }
  
  const provider = await Provider.findById(providerId);
  if (!provider) {
    throw new AppError('Provider not found', 404);
  }
  
  if (provider.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Unauthorized', 403);
  }
  
  const proof = await HygieneProof.create({
    providerId: providerId,
    imageUrl: imageUrl,
    type: type || 'kitchen',
    status: 'approved'
  });

  res.status(201).json({
    success: true,
    data: proof,
    message: 'Hygiene proof uploaded and approved successfully!'
  });
});

export const getHygieneProofs = catchAsync(async (req, res) => {
  const providerId = req.params.providerId || req.params.messId;

  const provider = await Provider.findById(providerId);
  if (!provider) {
    throw new AppError('Provider not found', 404);
  }

  const isOwnerOrAdmin =
    req.user &&
    (req.user.role === 'admin' || provider.ownerId.toString() === req.user.id);

  if (isOwnerOrAdmin) {
    await HygieneProof.updateMany(
      { providerId, status: 'pending' },
      { $set: { status: 'approved' } }
    );
  }
  
  const proofQuery = {
    providerId,
    ...(isOwnerOrAdmin ? {} : { status: 'approved' })
  };

  const proofs = await HygieneProof.find(proofQuery)
    .sort('-createdAt');
  
  res.json({
    success: true,
    data: proofs
  });
});

export const verifyHygieneProof = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const proof = await HygieneProof.findById(id);
  if (!proof) {
    throw new AppError('Proof not found', 404);
  }
  
  proof.status = status;
  await proof.save();
  
  res.json({
    success: true,
    data: proof,
    message: `Proof ${status}`
  });
});
