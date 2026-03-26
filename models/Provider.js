import mongoose from 'mongoose';

const providerSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: [true, 'Provider name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters']
    },
    providerType: {
      type: String,
      enum: ['mess', 'tiffin', 'home_kitchen'],
      default: 'mess',
      required: true
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    description: {
      type: String,
      maxlength: [500, 'Description too long']
    },

    // Location
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number],
          required: true,
          validate: {
            validator: function(v) {
              return v && v.length === 2;
            },
            message: 'Coordinates must be [longitude, latitude]'
          }
        }
      }
    },

    // Pricing & Food
    pricePerMeal: {
      type: Number,
      required: true,
      min: [10, 'Price too low'],
      max: [500, 'Price too high']
    },
    mealTypes: {
      type: [String],
      enum: ['breakfast', 'lunch', 'dinner', 'tiffin'],
      required: true
    },
    cuisineType: {
      type: [String],
      enum: ['north-indian', 'south-indian', 'chinese', 'gujarati', 'punjabi', 'bengali', 'multi-cuisine', 'maharashtrian'],
      default: ['multi-cuisine']
    },
    isVegetarian: { type: Boolean, default: false },

    // Real-time Status Fields
    status: {
      type: String,
      enum: ['open', 'closed', 'limited', 'unknown'],
      default: 'unknown'
    },
    reason: {
      type: String,
      maxlength: [200, 'Reason too long'],
      trim: true,
      default: ''
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    validTill: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 3 * 60 * 60 * 1000);
      }
    },

    // Trust Score Fields
    trustScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    uptimeScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    hygieneProof: [
      {
        imageUrl: { type: String, required: true },
        verified: { type: Boolean, default: false },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        verifiedAt: Date,
        uploadedAt: { type: Date, default: Date.now },
        description: String
      }
    ],

    // Statistics
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
    isUnderReview: { type: Boolean, default: false },

    // Status
    isActive: { type: Boolean, default: true },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for trust level
providerSchema.virtual('trustLevel').get(function() {
  if (this.trustScore >= 80) return 'Excellent';
  if (this.trustScore >= 60) return 'Good';
  if (this.trustScore >= 40) return 'Average';
  return 'Poor';
});

// Indexes for performance
providerSchema.index({ 'address.coordinates': '2dsphere' });
providerSchema.index({ status: 1, validTill: 1 });
providerSchema.index({ trustScore: -1, averageRating: -1 });

// Pre-save middleware - FIXED
/*providerSchema.pre('save', function(next) {
  try {
    if (this.isModified('status')) {
      this.lastUpdated = new Date();
      if (this.status !== 'unknown') {
        this.validTill = new Date(Date.now() + 3 * 60 * 60 * 1000);
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});*/


export default mongoose.model('Provider', providerSchema);