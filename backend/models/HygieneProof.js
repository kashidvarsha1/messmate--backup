import mongoose from 'mongoose';

const hygieneProofSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'kitchen'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('HygieneProof', hygieneProofSchema);
