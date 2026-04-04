import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  type: {
    type: String,
    enum: ['kitchen', 'food', 'dining_area', 'staff', 'certificate', 'general', 'storage', 'food_prep', 'cleaning'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  cloudinaryPublicId: { type: String },
  caption: { type: String, maxlength: 200 },
  metadata: {
    originalName: String,
    mimeType: String,
    size: Number,
    dimensions: { width: Number, height: Number },
    exifData: mongoose.Schema.Types.Mixed
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  verificationNotes: { type: String, maxlength: 500 },
  flags: [{
    reason: { type: String, enum: ['fake', 'misleading', 'copyright', 'inappropriate'] },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reportedAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes
mediaSchema.index({ providerId: 1, type: 1 });
mediaSchema.index({ providerId: 1, verified: 1 });
mediaSchema.index({ createdAt: -1 });

export default mongoose.model('Media', mediaSchema);
