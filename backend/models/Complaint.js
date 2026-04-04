import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
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
  category: {
    type: String,
    enum: ['food_quality', 'hygiene', 'delivery', 'behavior', 'pricing', 'other'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Complaint title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Complaint description is required'],
    maxlength: 2000
  },
  evidence: [{
    url: String,
    type: String, // image, video, document
    uploadedAt: Date
  }],
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'rejected', 'escalated'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  resolution: {
    type: String,
    maxlength: 1000
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  trustScoreImpact: {
    type: Number,
    default: -5,
    min: -30,
    max: 0
  },
  isRepeated: {
    type: Boolean,
    default: false
  },
  repeatedCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
complaintSchema.index({ messId: 1, status: 1 });
complaintSchema.index({ userId: 1, messId: 1 });
complaintSchema.index({ createdAt: -1 });

export default mongoose.model('Complaint', complaintSchema);