import Review from '../models/Review.js';
import ReviewFlag from '../models/ReviewFlag.js';
import UserInteraction from '../models/UserInteraction.js';

class FakeReviewDetection {
  // Analyze a review for suspicious patterns
  static async analyzeReview(review) {
    const flags = [];
    let confidenceScore = 0;

    // Check 1: User has interacted with the mess
    const hasInteraction = await UserInteraction.findOne({
      userId: review.userId,
      messId: review.messId
    });
    
    if (!hasInteraction) {
      flags.push('no_interaction');
      confidenceScore += 30;
    }

    // Check 2: Duplicate content
    const similarReviews = await Review.find({
      messId: review.messId,
      comment: { $regex: review.comment, $options: 'i' },
      _id: { $ne: review._id }
    });
    
    if (similarReviews.length > 0) {
      flags.push('duplicate_content');
      confidenceScore += 20 * Math.min(3, similarReviews.length);
    }

    // Check 3: Unusual review frequency from user
    const userReviews = await Review.find({
      userId: review.userId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });
    
    if (userReviews.length > 5) {
      flags.push('unusual_pattern');
      confidenceScore += 25;
    }

    // Check 4: Suspicious timing (e.g., 3am reviews)
    const hour = new Date(review.createdAt).getHours();
    if (hour < 4 || hour > 23) {
      flags.push('suspicious_timing');
      confidenceScore += 15;
    }

    // Check 5: Review pattern analysis (too many 5-star or 1-star)
    const messReviews = await Review.find({ messId: review.messId });
    const extremeRatings = messReviews.filter(r => r.rating === 5 || r.rating === 1).length;
    const extremePercentage = (extremeRatings / messReviews.length) * 100;
    
    if (extremePercentage > 80 && messReviews.length > 10) {
      flags.push('extreme_bias');
      confidenceScore += 20;
    }

    // Determine action
    let actionTaken = 'none';
    if (confidenceScore >= 70) actionTaken = 'removed';
    else if (confidenceScore >= 50) actionTaken = 'hidden';
    else if (confidenceScore >= 30) actionTaken = 'marked_verified';

    // Create flag record
    const reviewFlag = await ReviewFlag.create({
      reviewId: review._id,
      userId: review.userId,
      messId: review.messId,
      reason: flags[0],
      confidenceScore,
      actionTaken
    });

    // If confidence is high, automatically hide/remove the review
    if (actionTaken === 'removed') {
      await Review.findByIdAndUpdate(review._id, { isVisible: false });
    } else if (actionTaken === 'hidden') {
      await Review.findByIdAndUpdate(review._id, { isVisible: false, isFlagged: true });
    } else if (actionTaken === 'marked_verified') {
      await Review.findByIdAndUpdate(review._id, { isVerified: false, isFlagged: true });
    }

    return { flags, confidenceScore, actionTaken };
  }

  // Batch analyze reviews for a mess
  static async analyzeMessReviews(messId) {
    const reviews = await Review.find({ messId, isVisible: { $ne: false } });
    const results = [];
    
    for (const review of reviews) {
      const analysis = await this.analyzeReview(review);
      results.push({ reviewId: review._id, ...analysis });
    }
    
    return results;
  }
}

export default FakeReviewDetection;
