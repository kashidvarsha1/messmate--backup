import Mess from '../models/Mess.js';
import Review from '../models/Review.js';
import Complaint from '../models/Complaint.js';
import HygieneProof from '../models/HygieneProof.js';

class TrustScoreService {
  
  /**
   * Main function to calculate trust score for a mess
   * @param {string} messId - The ID of the mess
   * @returns {Promise<number>} - The calculated trust score (0-100)
   */
  static async calculateTrustScore(messId) {
    try {
      console.log(`Calculating trust score for mess: ${messId}`);
      
      // Find the mess
      const mess = await Mess.findById(messId);
      if (!mess) {
        throw new Error('Mess not found');
      }

      // Get all factors
      const reviews = await Review.find({ messId, isVisible: { $ne: false } });
      const complaints = await Complaint.find({ 
        messId, 
        status: { $ne: 'rejected' } 
      });
      const hygieneProofs = await HygieneProof.find({ 
        messId, 
        verified: true 
      });

      console.log(`Found ${reviews.length} reviews, ${complaints.length} complaints, ${hygieneProofs.length} hygiene proofs`);

      // Calculate individual scores
      const reviewScore = await this.calculateReviewScore(reviews, mess);
      const hygieneScore = await this.calculateHygieneScore(hygieneProofs);
      const complaintPenalty = await this.calculateComplaintPenalty(complaints);

      // Weighted calculation
      // Reviews: 40%, Hygiene: 30%, Complaints: -30% (penalty)
      let trustScore = (reviewScore * 0.4) + (hygieneScore * 0.3) + (100 + complaintPenalty) * 0.3;
      
      // Ensure score is within 0-100 range
      trustScore = Math.max(0, Math.min(100, trustScore));
      trustScore = Math.round(trustScore);

      console.log(`Calculated trust score: ${trustScore} (Review: ${reviewScore}, Hygiene: ${hygieneScore}, Penalty: ${complaintPenalty})`);

      // Update the mess with new trust score
      mess.trustScore = trustScore;
      mess.trustScoreBreakdown = {
        reviewScore: Math.round(reviewScore),
        hygieneScore: Math.round(hygieneScore),
        complaintPenalty: Math.round(complaintPenalty)
      };
      mess.lastTrustScoreUpdate = new Date();

      // Update trust badge based on score
      if (trustScore >= 80) {
        mess.trustBadge = 'excellent';
      } else if (trustScore >= 60) {
        mess.trustBadge = 'good';
      } else if (trustScore >= 40) {
        mess.trustBadge = 'average';
      } else {
        mess.trustBadge = 'poor';
      }

      // Update statistics
      //await mess.updateHygieneStats();
      //await mess.updateComplaintStats();
      //await mess.updateReviewStats();

      await mess.save();

      return trustScore;

    } catch (error) {
      console.error('Trust score calculation error:', error);
      throw error;
    }
  }

  /**
   * Calculate review score (0-100)
   * Based on average rating and number of reviews
   */
  static async calculateReviewScore(reviews, mess) {
    if (reviews.length === 0) {
      return 50; // Neutral score for no reviews
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = totalRating / reviews.length;
    
    // Convert 5-star rating to 0-100 scale
    let score = (avgRating / 5) * 100;
    
    // Bonus for number of reviews (max 10 points)
    const reviewCountBonus = Math.min(10, reviews.length / 2);
    score += reviewCountBonus;
    
    // Bonus for verified reviews (max 5 points)
    const verifiedCount = reviews.filter(r => r.isVerified).length;
    const verifiedBonus = Math.min(5, verifiedCount);
    score += verifiedBonus;
    
    // Penalty for flagged reviews (max -10 points)
    const flaggedCount = reviews.filter(r => r.isFlagged).length;
    const flaggedPenalty = Math.min(10, flaggedCount);
    score -= flaggedPenalty;
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate hygiene score (0-100)
   * Based on number and variety of hygiene proofs
   */
  static async calculateHygieneScore(hygieneProofs) {
    if (hygieneProofs.length === 0) {
      return 30; // Low base score for no proof
    }
    
    // Base score: 30 + 15 per proof (max 60 from count)
    let score = 30 + (Math.min(4, hygieneProofs.length) * 15);
    
    // Bonus for variety of proof types (max 20 points)
    const uniqueTypes = [...new Set(hygieneProofs.map(p => p.type))];
    const varietyBonus = Math.min(20, uniqueTypes.length * 5);
    score += varietyBonus;
    
    // Recency bonus (max 15 points)
    const recentProofs = hygieneProofs.filter(p => {
      const daysSince = (Date.now() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    });
    score += Math.min(15, recentProofs.length * 5);
    
    // Bonus for certificate type proofs (max 10 points)
    const certificateCount = hygieneProofs.filter(p => p.type === 'certificate').length;
    score += Math.min(10, certificateCount * 5);
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate complaint penalty (-100 to 0)
   * Penalty based on number, severity, and resolution of complaints
   */
  static async calculateComplaintPenalty(complaints) {
    if (complaints.length === 0) {
      return 0;
    }
    
    let penalty = 0;
    
    for (const complaint of complaints) {
      // Base penalty based on priority
      switch (complaint.priority) {
        case 'critical':
          penalty += 15;
          break;
        case 'high':
          penalty += 10;
          break;
        case 'medium':
          penalty += 5;
          break;
        case 'low':
          penalty += 2;
          break;
        default:
          penalty += 3;
      }
      
      // Additional penalty for repeated issues
      if (complaint.isRepeated) {
        penalty += complaint.repeatedCount * 5;
      }
      
      // Category-based penalty
      switch (complaint.category) {
        case 'hygiene':
          penalty += 5;
          break;
        case 'food_quality':
          penalty += 3;
          break;
        case 'behavior':
          penalty += 4;
          break;
        default:
          penalty += 1;
      }
      
      // Less penalty if resolved quickly
      if (complaint.resolvedAt) {
        const resolutionDays = (complaint.resolvedAt - complaint.createdAt) / (1000 * 60 * 60 * 24);
        if (resolutionDays <= 1) {
          penalty -= 5; // Quick resolution reduces penalty
        } else if (resolutionDays <= 3) {
          penalty -= 2;
        } else if (resolutionDays > 7) {
          penalty += 3; // Slow resolution increases penalty
        }
      } else {
        // Unresolved complaints increase penalty
        penalty += 2;
      }
    }
    
    // Ensure penalty doesn't exceed 100
    return -Math.min(100, penalty);
  }

  /**
   * Recalculate trust score after any relevant event
   * @param {string} messId - The ID of the mess
   * @returns {Promise<number>} - The updated trust score
   */
  static async updateTrustScore(messId) {
    return await this.calculateTrustScore(messId);
  }

  /**
   * Bulk update trust scores for all messes
   * @returns {Promise<Array>} - Results of updates
   */
  static async updateAllTrustScores() {
    try {
      const messes = await Mess.find({ isActive: true });
      const results = [];
      
      for (const mess of messes) {
        const newScore = await this.calculateTrustScore(mess._id);
        results.push({
          messId: mess._id,
          name: mess.name,
          oldScore: mess.trustScore,
          newScore: newScore,
          changed: mess.trustScore !== newScore
        });
        
        console.log(`Updated ${mess.name}: ${mess.trustScore} → ${newScore}`);
      }
      
      return results;
    } catch (error) {
      console.error('Bulk update error:', error);
      throw error;
    }
  }

  /**
   * Get trust score insights for a mess
   * @param {string} messId - The ID of the mess
   * @returns {Promise<Object>} - Insights and recommendations
   */
  static async getTrustInsights(messId) {
    try {
      const mess = await Mess.findById(messId);
      if (!mess) {
        throw new Error('Mess not found');
      }

      const reviews = await Review.find({ messId });
      const complaints = await Complaint.find({ messId });
      const hygieneProofs = await HygieneProof.find({ messId });

      const insights = {
        currentScore: mess.trustScore,
        badge: mess.trustBadge,
        breakdown: mess.trustScoreBreakdown,
        
        factors: {
          reviewCount: reviews.length,
          averageRating: reviews.length > 0 ? 
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
          complaintCount: complaints.length,
          unresolvedComplaints: complaints.filter(c => c.status !== 'resolved').length,
          hygieneProofCount: hygieneProofs.length,
          verifiedProofs: hygieneProofs.filter(p => p.verified).length
        },
        
        recommendations: [],
        
        strengths: [],
        weaknesses: []
      };

      // Generate recommendations based on current state
      if (mess.trustScoreBreakdown.hygieneScore < 60) {
        insights.recommendations.push({
          type: 'hygiene',
          message: 'Upload more hygiene proofs to improve your trust score',
          urgency: 'high',
          action: 'Upload kitchen, storage, and food preparation photos'
        });
        insights.weaknesses.push('Low hygiene verification');
      } else {
        insights.strengths.push('Good hygiene practices');
      }

      if (mess.trustScoreBreakdown.reviewScore < 50) {
        insights.recommendations.push({
          type: 'reviews',
          message: 'Encourage satisfied customers to leave reviews',
          urgency: 'medium',
          action: 'Ask customers to share their experience'
        });
        insights.weaknesses.push('Limited customer reviews');
      } else if (mess.trustScoreBreakdown.reviewScore > 80) {
        insights.strengths.push('Excellent customer reviews');
      }

      if (mess.trustScoreBreakdown.complaintPenalty < -20) {
        insights.recommendations.push({
          type: 'complaints',
          message: 'Address customer complaints promptly to reduce penalty',
          urgency: 'high',
          action: 'Review and resolve pending complaints within 24 hours'
        });
        insights.weaknesses.push('Multiple customer complaints');
      }

      if (mess.hygieneStats.verifiedProofs < 3) {
        insights.recommendations.push({
          type: 'verification',
          message: 'Get your kitchen verified with at least 3 hygiene proofs',
          urgency: 'high',
          action: 'Upload kitchen cleanliness, staff hygiene, and food storage photos'
        });
      }

      if (mess.totalReviews < 5) {
        insights.recommendations.push({
          type: 'reviews',
          message: 'Having at least 5 reviews will make your mess more credible',
          urgency: 'low',
          action: 'Encourage more customers to leave feedback'
        });
      }

      // Add time-based recommendations
      if (mess.lastTrustScoreUpdate && 
          (Date.now() - new Date(mess.lastTrustScoreUpdate)) > 30 * 24 * 60 * 60 * 1000) {
        insights.recommendations.push({
          type: 'update',
          message: 'Update your trust profile with recent hygiene proofs',
          urgency: 'medium',
          action: 'Upload current kitchen and food preparation photos'
        });
      }

      return insights;
      
    } catch (error) {
      console.error('Get trust insights error:', error);
      throw error;
    }
  }

  /**
   * Get trust score history (trend analysis)
   * @param {string} messId - The ID of the mess
   * @returns {Promise<Object>} - Score history and trends
   */
  static async getTrustHistory(messId) {
    try {
      const mess = await Mess.findById(messId);
      if (!mess) {
        throw new Error('Mess not found');
      }

      // Get all related events with timestamps
      const reviews = await Review.find({ messId }).sort({ createdAt: 1 });
      const complaints = await Complaint.find({ messId }).sort({ createdAt: 1 });
      const hygieneProofs = await HygieneProof.find({ messId }).sort({ createdAt: 1 });

      const timeline = [];
      
      // Add review events
      reviews.forEach(review => {
        timeline.push({
          date: review.createdAt,
          type: 'review',
          impact: review.rating >= 4 ? 'positive' : 'negative',
          description: `${review.rating}-star review received`,
          details: review.comment?.substring(0, 100)
        });
      });
      
      // Add complaint events
      complaints.forEach(complaint => {
        timeline.push({
          date: complaint.createdAt,
          type: 'complaint',
          impact: 'negative',
          description: `${complaint.category} complaint: ${complaint.title}`,
          details: complaint.description?.substring(0, 100)
        });
      });
      
      // Add hygiene proof events
      hygieneProofs.forEach(proof => {
        timeline.push({
          date: proof.createdAt,
          type: 'hygiene',
          impact: proof.verified ? 'positive' : 'neutral',
          description: `${proof.type} hygiene proof ${proof.verified ? 'verified' : 'uploaded'}`,
          details: proof.description
        });
      });
      
      // Sort timeline by date
      timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      return {
        currentScore: mess.trustScore,
        badge: mess.trustBadge,
        lastUpdated: mess.lastTrustScoreUpdate,
        timeline,
        eventCount: timeline.length
      };
      
    } catch (error) {
      console.error('Get trust history error:', error);
      throw error;
    }
  }

  /**
   * Compare trust scores between multiple messes
   * @param {Array} messIds - Array of mess IDs
   * @returns {Promise<Array>} - Comparison data
   */
  static async compareTrustScores(messIds) {
    try {
      const comparisons = [];
      
      for (const messId of messIds) {
        const mess = await Mess.findById(messId);
        if (mess) {
          comparisons.push({
            id: mess._id,
            name: mess.name,
            trustScore: mess.trustScore,
            trustBadge: mess.trustBadge,
            breakdown: mess.trustScoreBreakdown,
            reviewCount: mess.totalReviews,
            complaintCount: mess.complaintStats?.total || 0,
            hygieneCount: mess.hygieneStats?.verifiedProofs || 0
          });
        }
      }
      
      // Sort by trust score descending
      comparisons.sort((a, b) => b.trustScore - a.trustScore);
      
      return comparisons;
      
    } catch (error) {
      console.error('Compare trust scores error:', error);
      throw error;
    }
  }
}

export default TrustScoreService;