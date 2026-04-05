import Feedback from '../models/Feedback.js';
import AppError from '../utils/AppError.js';

/**
 * Submit feedback from authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const submitFeedback = async (req, res, next) => {
  try {
    const { rating, message } = req.body;
    const userId = req.user.id;
    const userName = req.user.name;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return next(new AppError('Rating must be between 1 and 5', 400));
    }

    if (!message || !message.trim()) {
      return next(new AppError('Message is required', 400));
    }

    if (message.trim().length > 500) {
      return next(new AppError('Message cannot exceed 500 characters', 400));
    }

    // Create feedback
    const feedback = await Feedback.create({
      userId,
      userName,
      rating,
      message: message.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all feedback (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getAllFeedback = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return next(new AppError('Only admins can view all feedback', 403));
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const feedback = await Feedback.find()
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalFeedback = await Feedback.countDocuments();

    res.status(200).json({
      success: true,
      totalFeedback,
      currentPage: page,
      totalPages: Math.ceil(totalFeedback / limit),
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get feedback statistics (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getFeedbackStats = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return next(new AppError('Only admins can view feedback statistics', 403));
    }

    const totalFeedback = await Feedback.countDocuments();
    const averageRating = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    const ratingDistribution = await Feedback.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalFeedback,
        averageRating: averageRating[0]?.avgRating || 0,
        ratingDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete feedback (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const deleteFeedback = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return next(new AppError('Only admins can delete feedback', 403));
    }

    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return next(new AppError('Feedback not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
