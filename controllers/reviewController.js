import Review from '../models/Review.js';
import Provider from '../models/Provider.js';

export const createReview = async (req, res) => {
  try {
    const { providerId, rating, comment, images } = req.body;

    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    const existingReview = await Review.findOne({
      userId: req.user.id,
      providerId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this provider'
      });
    }

    const review = await Review.create({
      userId: req.user.id,
      providerId,
      rating,
      comment,
      images: images || [],
      isVerified: false,
      isVisible: true
    });

    const reviews = await Review.find({ providerId, isVisible: true });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    provider.averageRating = totalRating / reviews.length;
    provider.totalReviews = reviews.length;
    await provider.save();

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review submitted successfully!'
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
};

export const getReviewsByProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    
    const reviews = await Review.find({ providerId, isVisible: true })
      .populate('userId', 'name profilePicture userTrustScore')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews'
    });
  }
};

export const flagReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.complaintFlag = true;
    await review.save();

    res.status(200).json({
      success: true,
      data: review,
      message: 'Review flagged for review'
    });
  } catch (error) {
    console.error('Flag review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error flagging review'
    });
  }
};
