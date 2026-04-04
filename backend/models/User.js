import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ['customer', 'owner', 'admin'],
      default: 'customer'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    profilePicture: {
      type: String,
      default: 'default-avatar.png'
    },
    userTrustScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    totalReports: {
      type: Number,
      default: 0
    },
    reportsResolved: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    helpfulVotes: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    },
    resetOtpHash: {
      type: String,
      select: false
    },
    resetOtpExpiry: {
      type: Date,
      select: false
    }
  },
  {
    timestamps: true
  }
);

// NO PRE-SAVE HOOK HERE - We'll hash password in controller

const User = mongoose.model('User', userSchema);

export default User;
