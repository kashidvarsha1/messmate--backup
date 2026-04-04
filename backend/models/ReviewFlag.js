import mongoose from 'mongoose';

const reviewFlagSchema = new mongoose.Schema({
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mess',
    required: true
  },
  reason: {
    type: String,
    enum: ['suspicious_timing', 'duplicate_content', 'unusual_pattern', 'flagged_by_users', 'no_interaction'],
    required: true
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  actionTaken: {
    type: String,
    enum: ['none', 'hidden', 'removed', 'marked_verified'],
    default: 'none'
  },
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

reviewFlagSchema.index({ reviewId: 1 });
reviewFlagSchema.index({ messId: 1, createdAt: -1 });

export default mongoose.model('ReviewFlag', reviewFlagSchema);