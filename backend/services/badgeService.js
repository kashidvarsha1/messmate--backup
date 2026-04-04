import Provider from '../models/Provider.js';
import VerificationBadge from '../models/VerificationBadge.js';
import Review from '../models/Review.js';
import Report from '../models/Report.js';
import Media from '../models/Media.js';

class BadgeService {
  
  static async updateVerificationBadge(providerId) {
    const provider = await Provider.findById(providerId);
    if (!provider) return;

    const reviews = await Review.find({ providerId, isVisible: true });
    const reports = await Report.find({ providerId, status: 'verified' });
    const media = await Media.find({ providerId, verified: true });

    let newBadge = 'NOT_VERIFIED';
    let requirements = {};

    // Check for HYGIENE_CERTIFIED
    if (reviews.length >= 20 && 
        provider.averageRating >= 4.0 && 
        reports.length <= 2 && 
        media.length >= 5 &&
        provider.hygieneScore >= 4.0) {
      newBadge = 'HYGIENE_CERTIFIED';
      requirements = {
        minReviews: 20,
        minRating: 4.0,
        maxComplaints: 2,
        minMediaCount: 5,
        adminVerified: true
      };
    }
    // Check for BASIC_VERIFIED
    else if (reviews.length >= 10 && 
             provider.averageRating >= 3.5 && 
             reports.length <= 5 && 
             media.length >= 2) {
      newBadge = 'BASIC_VERIFIED';
      requirements = {
        minReviews: 10,
        minRating: 3.5,
        maxComplaints: 5,
        minMediaCount: 2
      };
    }

    // Update badge if changed
    if (provider.verificationBadge !== newBadge) {
      const oldBadge = provider.verificationBadge;
      provider.verificationBadge = newBadge;
      await provider.save();

      // Update badge history
      await VerificationBadge.findOneAndUpdate(
        { providerId },
        {
          $set: { badgeType: newBadge, requirements },
          $push: {
            history: {
              oldBadge,
              newBadge,
              reason: `Auto-updated based on metrics`,
              changedAt: new Date()
            }
          }
        },
        { upsert: true, new: true }
      );
    }

    return newBadge;
  }

  static async getBadgeDetails(providerId) {
    const badge = await VerificationBadge.findOne({ providerId });
    if (!badge) return null;

    return {
      type: badge.badgeType,
      requirements: badge.requirements,
      achievements: badge.achievements,
      history: badge.history
    };
  }
}

export default BadgeService;