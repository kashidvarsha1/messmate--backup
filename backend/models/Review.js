// models/Review.js
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment too long'],
      trim: true
    },
    images: [
      {
        url: String,
        caption: String
      }
    ],
    isVerified: {
      type: Boolean,
      default: false,
      description: 'Review from verified interaction'
    },
    complaintFlag: {
      type: Boolean,
      default: false,
      description: 'Marked as suspicious by users'
    },
    isVisible: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
reviewSchema.index({ providerId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, providerId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);