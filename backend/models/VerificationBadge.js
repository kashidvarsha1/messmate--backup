import mongoose from 'mongoose';

const verificationBadgeSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true,
    unique: true
  },
  badgeType: {
    type: String,
    enum: ['NOT_VERIFIED', 'BASIC_VERIFIED', 'HYGIENE_CERTIFIED'],
    default: 'NOT_VERIFIED'
  },
  requirements: {
    minReviews: { type: Number, default: 0 },
    minRating: { type: Number, default: 0 },
    maxComplaints: { type: Number, default: 0 },
    minMediaCount: { type: Number, default: 0 },
    adminVerified: { type: Boolean, default: false }
  },
  achievements: [{
    type: { type: String, enum: ['review_milestone', 'hygiene_photo', 'complaint_free', 'admin_verified'] },
    achievedAt: { type: Date, default: Date.now }
  }],
  history: [{
    oldBadge: String,
    newBadge: String,
    reason: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  expiresAt: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('VerificationBadge', verificationBadgeSchema);