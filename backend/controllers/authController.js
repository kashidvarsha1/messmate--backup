import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendPasswordResetOtp, sendWelcomeEmail } from '../services/emailService.js';

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const normalizeEmail = (email = '') => email.trim().toLowerCase();
const normalizePhone = (phone = '') => phone.replace(/\D/g, '');
const canSendEmails = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) &&
  !String(process.env.SMTP_USER).includes('your_email');

// Create and send token response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      userTrustScore: user.userTrustScore,
      profilePicture: user.profilePicture,
      isActive: user.isActive
    }
  });
};

// Register user
export const register = async (req, res) => {
  try {
    const { name, password, role } = req.body;
    const email = normalizeEmail(req.body.email);
    const phone = normalizePhone(req.body.phone);
    const allowedRoles = new Set(['customer', 'owner']);
    const safeRole = allowedRoles.has(role) ? role : 'customer';

    if (!name?.trim() || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and password are required'
      });
    }

    if (phone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be 10 digits long'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email,
      phone,
      password: hashedPassword,
      role: safeRole,
      userTrustScore: 50
    });

    if (canSendEmails()) {
      sendWelcomeEmail(user).catch(() => {});
    }

    createSendToken(user, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during registration'
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);

    // Find user by email or phone
    const user = await User.findOne({ 
      $or: [{ email }, { phone: email }] 
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    createSendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during login'
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { name, profilePicture } = req.body;
    const phone = req.body.phone !== undefined ? normalizePhone(req.body.phone) : undefined;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) {
      if (phone.length !== 10) {
        return res.status(400).json({
          success: false,
          message: 'Phone number must be 10 digits long'
        });
      }
      updateData.phone = phone;
    }
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id).select('+password');
    
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
};

// Deactivate account
export const deactivateAccount = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { isActive: false });
    
    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating account'
    });
  }
};

// Get user stats
export const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('userTrustScore totalReports reportsResolved totalReviews helpfulVotes');
    
    const getTrustLevel = (score) => {
      if (score >= 80) return 'Highly Trusted';
      if (score >= 60) return 'Trusted';
      if (score >= 40) return 'Average';
      return 'New User';
    };
    
    res.status(200).json({
      success: true,
      stats: {
        trustScore: user.userTrustScore,
        totalReports: user.totalReports,
        reportsResolved: user.reportsResolved,
        totalReviews: user.totalReviews,
        helpfulVotes: user.helpfulVotes,
        trustLevel: getTrustLevel(user.userTrustScore)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user stats'
    });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const token = signToken(req.user.id);
    
    res.status(200).json({
      success: true,
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error refreshing token'
    });
  }
};

// Logout
export const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Forgot Password - Send reset OTP
export const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ email }).select('+resetOtpHash +resetOtpExpiry');

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, an OTP has been sent.'
      });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOtpHash = crypto.createHash('sha256').update(otp).digest('hex');
    user.resetOtpExpiry = otpExpiry;
    await user.save({ validateBeforeSave: false });

    if (canSendEmails()) {
      await sendPasswordResetOtp({
        email: user.email,
        name: user.name,
        otp
      });
    } else if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({
        success: false,
        message: 'Password reset email service is not configured'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, an OTP has been sent.',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to process forgot password request right now' });
  }
};

// Reset Password - Verify OTP and set new password
export const resetPassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    const email = normalizeEmail(req.body.email);
    
    const user = await User.findOne({ email }).select('+password +resetOtpHash +resetOtpExpiry');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (!otp || !user.resetOtpHash) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    
    if (!user.resetOtpExpiry || user.resetOtpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    if (user.resetOtpHash !== otpHash) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtpHash = undefined;
    user.resetOtpExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    
    res.status(200).json({
      success: true,
      message: 'Password reset successful! Please login with new password.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
