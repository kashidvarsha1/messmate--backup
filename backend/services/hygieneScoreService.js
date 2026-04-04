import Provider from '../models/Provider.js';
import Review from '../models/Review.js';
import Report from '../models/Report.js';
import Media from '../models/Media.js';

class HygieneScoreService {
  
  /**
   * Calculate hygiene score (0-5) for a provider
   * Formula: Base 3 + (ReviewScore × 0.4) + (MediaBonus × 0.3) - (ComplaintPenalty × 0.3)
   */
  static async calculateHygieneScore(providerId) {
    try {
      const provider = await Provider.findById(providerId);
      if (!provider) throw new Error('Provider not found');

      // Get data
      const reviews = await Review.find({ providerId, isVisible: true });
      const verifiedReports = await Report.find({ 
        providerId, 
        status: 'verified',
        category: 'bad_hygiene'
      });
      const media = await Media.find({ providerId, verified: true });

      // Calculate components
      const reviewScore = this.calculateReviewScore(reviews);
      const mediaBonus = this.calculateMediaBonus(media);
      const complaintPenalty = this.calculateComplaintPenalty(verifiedReports);

      // Final score: Base 3 + weighted components
      let hygieneScore = 3 + (reviewScore * 0.4) + (mediaBonus * 0.3) + (complaintPenalty * 0.3);
      
      // Ensure score is within 0-5 range
      hygieneScore = Math.max(0, Math.min(5, parseFloat(hygieneScore.toFixed(1))));

      // Update provider
      provider.hygieneScore = hygieneScore;
      provider.hygieneScoreBreakdown = {
        reviewScore: parseFloat(reviewScore.toFixed(1)),
        complaintPenalty: parseFloat(complaintPenalty.toFixed(1)),
        verificationBonus: parseFloat(mediaBonus.toFixed(1))
      };
      
      await provider.save();
      return hygieneScore;

    } catch (error) {
      console.error('Hygiene score calculation error:', error);
      throw error;
    }
  }

  /**
   * Calculate review score contribution (0-2)
   */
  static calculateReviewScore(reviews) {
    if (reviews.length === 0) return 0;
    
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    // Convert 5-star to 0-2 scale
    let score = (avgRating / 5) * 2;
    
    // Bonus for number of reviews (max +0.5)
    const reviewCountBonus = Math.min(0.5, reviews.length / 20);
    score += reviewCountBonus;
    
    return Math.min(2, score);
  }

  /**
   * Calculate media bonus (0-1.5)
   */
  static calculateMediaBonus(media) {
    if (media.length === 0) return 0;
    
    let bonus = 0;
    
    // Base bonus for verified media
    bonus += Math.min(1, media.length * 0.25);
    
    // Bonus for variety of media types
    const types = [...new Set(media.map(m => m.type))];
    bonus += Math.min(0.5, types.length * 0.1);
    
    // Bonus for recent media (within 30 days)
    const recentMedia = media.filter(m => {
      const daysSince = (Date.now() - new Date(m.createdAt)) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    });
    bonus += Math.min(0.3, recentMedia.length * 0.05);
    
    return Math.min(1.5, bonus);
  }

  /**
   * Calculate complaint penalty (-2 to 0)
   */
  static calculateComplaintPenalty(complaints) {
    if (complaints.length === 0) return 0;
    
    let penalty = 0;
    
    for (const complaint of complaints) {
      // Base penalty by severity
      switch (complaint.severity) {
        case 'critical': penalty += 0.8; break;
        case 'high': penalty += 0.5; break;
        case 'medium': penalty += 0.3; break;
        default: penalty += 0.1;
      }
      
      // Additional penalty for unresolved issues
      if (complaint.status !== 'resolved') {
        penalty += 0.2;
      }
    }
    
    return -Math.min(2, penalty);
  }

  /**
   * Update hygiene score for a provider
   */
  static async updateHygieneScore(providerId) {
    return await this.calculateHygieneScore(providerId);
  }

  /**
   * Bulk update hygiene scores for all providers
   */
  static async updateAllScores() {
    const providers = await Provider.find({ isActive: true });
    const results = [];
    
    for (const provider of providers) {
      const newScore = await this.calculateHygieneScore(provider._id);
      results.push({
        providerId: provider._id,
        name: provider.name,
        oldScore: provider.hygieneScore,
        newScore
      });
    }
    
    return results;
  }

  /**
   * Get detailed hygiene insights for a provider
   */
  static async getHygieneInsights(providerId) {
    const provider = await Provider.findById(providerId);
    if (!provider) throw new Error('Provider not found');

    const reviews = await Review.find({ providerId, isVisible: true });
    const reports = await Report.find({ providerId, status: 'verified' });
    const media = await Media.find({ providerId, verified: true });

    return {
      currentScore: provider.hygieneScore,
      hygieneLevel: provider.hygieneLevel,
      breakdown: provider.hygieneScoreBreakdown,
      factors: {
        reviewCount: reviews.length,
        averageRating: reviews.length > 0 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
          : 0,
        complaintCount: reports.length,
        verifiedMediaCount: media.length,
        mediaByType: this.groupMediaByType(media)
      },
      recommendations: this.generateRecommendations(provider, reviews, reports, media)
    };
  }

  static groupMediaByType(media) {
    const types = { kitchen: 0, food: 0, dining_area: 0, staff: 0, certificate: 0 };
    media.forEach(m => {
      if (types[m.type] !== undefined) types[m.type]++;
    });
    return types;
  }

  static generateRecommendations(provider, reviews, reports, media) {
    const recommendations = [];

    if (reviews.length < 10) {
      recommendations.push({
        type: 'reviews',
        message: 'Encourage more customers to leave reviews to improve hygiene score',
        urgency: 'medium'
      });
    }

    if (reports.length > 0) {
      recommendations.push({
        type: 'complaints',
        message: 'Address hygiene complaints promptly to reduce penalty',
        urgency: 'high'
      });
    }

    if (media.length < 3) {
      recommendations.push({
        type: 'media',
        message: 'Upload more hygiene proof photos to build trust',
        urgency: 'high'
      });
    }

    if (provider.verificationBadge === 'NOT_VERIFIED') {
      recommendations.push({
        type: 'verification',
        message: 'Complete verification process to earn trust badge',
        urgency: 'high'
      });
    }

    return recommendations;
  }
}

export default HygieneScoreService;
