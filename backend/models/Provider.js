import mongoose from 'mongoose';

const providerSchema = new mongoose.Schema({
  // Basic Info
  name: { type: String, required: true, trim: true },
  providerType: { type: String, enum: ['mess', 'tiffin', 'home_kitchen'], default: 'mess' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, maxlength: 500 },

  // Location
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    }
  },

  // Pricing
  pricePerMeal: { type: Number, required: true, min: 10, max: 500 },
  menu: [{
    itemName: { type: String, required: true, maxlength: 100 },
    price: { type: Number, required: true, min: 1 },
    category: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'tiffin', 'snacks', 'drinks', 'other'], default: 'lunch' },
    isAvailable: { type: Boolean, default: true },
    isVeg: { type: Boolean, default: true }
  }],
  mealTypes: { type: [String], enum: ['breakfast', 'lunch', 'dinner', 'tiffin'], required: true },
  cuisineType: { type: [String], default: ['multi-cuisine'] },
  isVegetarian: { type: Boolean, default: false },

  // ========== HYGIENE SYSTEM FIELDS ==========
  hygieneScore: {
    type: Number,
    default: 3.0,
    min: 0,
    max: 5,
    description: 'Dynamic hygiene score (0-5) based on reviews, complaints, verification'
  },
  hygieneScoreBreakdown: {
    reviewScore: { type: Number, default: 0, min: 0, max: 5 },
    complaintPenalty: { type: Number, default: 0, min: -5, max: 0 },
    verificationBonus: { type: Number, default: 0, min: 0, max: 2 }
  },
  
  // Verification Badge
  verificationBadge: {
    type: String,
    enum: ['NOT_VERIFIED', 'BASIC_VERIFIED', 'HYGIENE_CERTIFIED'],
    default: 'NOT_VERIFIED'
  },
  
  // Status
  status: { type: String, enum: ['open', 'closed', 'limited', 'unknown'], default: 'unknown' },
  reason: { type: String, default: '' },
  lastUpdated: { type: Date, default: Date.now },
  validTill: { type: Date, default: () => new Date(Date.now() + 3 * 60 * 60 * 1000) },
  
  // Trust Scores
  trustScore: { type: Number, default: 50, min: 0, max: 100 },
  
  // Statistics
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  totalComplaints: { type: Number, default: 0 },
  resolvedComplaints: { type: Number, default: 0 },
  totalMedia: { type: Number, default: 0 },
  verifiedMedia: { type: Number, default: 0 },
  
  isActive: { type: Boolean, default: true },
  isUnderReview: { type: Boolean, default: false }
}, { timestamps: true });

// Indexes
providerSchema.index({ hygieneScore: -1 });
providerSchema.index({ verificationBadge: 1 });
providerSchema.index({ 'address.coordinates': '2dsphere' });

// Virtual for hygiene level
providerSchema.virtual('hygieneLevel').get(function() {
  if (this.hygieneScore >= 4.5) return 'Excellent';
  if (this.hygieneScore >= 3.5) return 'Good';
  if (this.hygieneScore >= 2.5) return 'Average';
  return 'Needs Improvement';
});

export default mongoose.model('Provider', providerSchema);
