import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY
  });
};

// Register user
export const signup = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists by email
    const userByEmail = await User.findOne({ email: email.toLowerCase() });
    if (userByEmail) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Check if user already exists by phone
    const userByPhone = await User.findOne({ phone });
    if (userByPhone) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this phone number'
      });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: role || 'customer'
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id);

    // Return response without password
    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error during registration',
      error: error.message
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    // Validate required fields
    if (!password || (!email && !phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/phone and password'
      });
    }

    // Find user by email or phone
    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    } else if (phone) {
      user = await User.findOne({ phone }).select('+password');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/phone or password'
      });
    }

    // Compare password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/phone or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Return response without password
    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePicture: user.profilePicture,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};
