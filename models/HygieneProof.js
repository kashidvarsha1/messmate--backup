import mongoose from 'mongoose';

const hygieneProofSchema = new mongoose.Schema({
  messId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mess',
    required: [true, 'Mess ID is required']
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  type: {
    type: String,
    enum: ['kitchen', 'storage', 'staff', 'food_prep', 'cleaning', 'certificate'],
    required: true
  },
  mediaUrl: {
    type: String,
    required: [true, 'Media URL is required']
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  trustScoreImpact: {
    type: Number,
    default: 0,
    min: -10,
    max: 20
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
hygieneProofSchema.index({ messId: 1, createdAt: -1 });
hygieneProofSchema.index({ ownerId: 1, verified: 1 });

export default mongoose.model('HygieneProof', hygieneProofSchema);