import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
    userTrustScore: {
      type: Number,
      default: 50
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
    }
  },
  {
    timestamps: true
  }
);

// Simple password hashing - NO async to avoid issues
userSchema.pre('save', function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
