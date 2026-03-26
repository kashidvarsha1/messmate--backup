import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
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
    message: {
      type: String,
      required: true,
      maxlength: 500
    },
    status: {
      type: String,
      enum: ['pending', 'responded', 'resolved', 'closed'],
      default: 'pending'
    },
    response: {
      type: String,
      maxlength: 1000
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  { timestamps: true }
);

// Index on userId
enquirySchema.index({ userId: 1 });

// Index on messId
enquirySchema.index({ messId: 1 });

// Compound index on status and createdAt for efficient queries
enquirySchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Enquiry', enquirySchema);
