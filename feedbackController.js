import Feedback from '../models/Feedback.js';
import catchAsync from '../utils/catchAsync.js';

// Submit feedback
export const submitFeedback = catchAsync(async (req, res) => {
  const { rating, message } = req.body;
  
  const feedback = await Feedback.create({
    userName: req.user.name,
    rating,
    message
  });
  
  res.status(201).json({
    success: true,
    message: 'Thank you for your feedback! 🙏'
  });
});

// Get all feedback (public)
export const getFeedback = catchAsync(async (req, res) => {
  const feedback = await Feedback.find()
    .sort('-createdAt')
    .limit(20);
  
  res.json({
    success: true,
    data: feedback
  });
});