import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
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
  category: {
    type: String,
    enum: ['bad_hygiene', 'fake_review', 'food_quality', 'misleading_info', 'staff_behavior', 'other'],
    required: true
  },
  subCategory: {
    type: String,
    enum: [
      'dirty_kitchen', 'stale_food', 'pest_issue', 'unclean_storage',
      'fake_positive_review', 'fake_negative_review', 'paid_review',
      'bad_taste', 'undercooked', 'foreign_object',
      'wrong_menu', 'price_mismatch', 'closed_but_open'
    ]
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  evidence: [{
    url: { type: String },
    type: { type: String, enum: ['image', 'video'] },
    uploadedAt: { type: Date, default: Date.now }
  }],
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'verified', 'dismissed', 'resolved'],
    default: 'pending'
  },
  impact: {
    hygienePenalty: { type: Number, default: 0, min: -2, max: 0 },
    trustPenalty: { type: Number, default: 0, min: -20, max: 0 }
  },
  adminNote: { type: String, maxlength: 500 },
  resolvedAt: Date,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Indexes
reportSchema.index({ providerId: 1, status: 1 });
reportSchema.index({ userId: 1, providerId: 1 });
reportSchema.index({ createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);

export const dropLegacyReportIndexes = async () => {
  try {
    const indexes = await Report.collection.indexes();
    const legacyIndex = indexes.find((index) => index.name === 'userId_1_providerId_1_type_1');

    if (legacyIndex) {
      await Report.collection.dropIndex(legacyIndex.name);
      console.log(`Dropped legacy report index: ${legacyIndex.name}`);
    }
  } catch (error) {
    if (error.codeName === 'NamespaceNotFound' || error.codeName === 'IndexNotFound') {
      return;
    }

    console.error('Failed to clean legacy report indexes:', error.message);
  }
};

export default Report;
