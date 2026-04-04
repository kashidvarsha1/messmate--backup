import mongoose from 'mongoose';

const userInteractionSchema = new mongoose.Schema({
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
  interactionType: {
    type: String,
    enum: ['enquiry', 'visit', 'order', 'complaint'],
    required: true
  },
  interactionDate: {
    type: Date,
    default: Date.now
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure unique interaction per type
userInteractionSchema.index({ userId: 1, messId: 1, interactionType: 1 }, { unique: true });

export default mongoose.model('UserInteraction', userInteractionSchema);
