// models/Report.js
import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ['closed_but_open', 'food_not_available', 'fake_info', 'wrong_location', 'wrong_price'],
      required: true
    },
    description: {
      type: String,
      maxlength: [500, 'Description too long'],
      trim: true
    },
    userTrustScore: {
      type: Number,
      default: 50,
      description: 'Trust score of reporting user at time of report'
    },
    resolved: {
      type: Boolean,
      default: false
    },
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    adminNote: String
  },
  {
    timestamps: true
  }
);

// Ensure one user can report same provider only once per type
reportSchema.index({ userId: 1, providerId: 1, type: 1 }, { unique: true });

export default mongoose.model('Report', reportSchema);
