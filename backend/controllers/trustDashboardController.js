import Mess from '../models/Mess.js';
import TrustScoreService from '../services/trustScoreService.js';

// Get trust dashboard for a mess
export const getTrustDashboard = async (req, res) => {
  try {
    const { messId } = req.params;
    
    const mess = await Mess.findById(messId)
      .populate('ownerId', 'name email phone');
    
    if (!mess) {
      return res.status(404).json({
        success: false,
        message: 'Mess not found'
      });
    }

    // Get recent reviews
    const Review = await import('../models/Review.js').then(m => m.default);
    const reviews = await Review.find({ messId, isVisible: { $ne: false } })
      .sort('-createdAt')
      .limit(5)
      .populate('userId', 'name');

    // Get recent complaints
    const Complaint = await import('../models/Complaint.js').then(m => m.default);
    const complaints = await Complaint.find({ messId })
      .sort('-createdAt')
      .limit(5);

    // Get hygiene proofs
    const HygieneProof = await import('../models/HygieneProof.js').then(m => m.default);
    const hygieneProofs = await HygieneProof.find({ messId, verified: true })
      .sort('-createdAt')
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        trustScore: mess.trustScore,
        trustBadge: mess.trustBadge,
        trustLevel: mess.trustLevel,
        breakdown: mess.trustScoreBreakdown,
        recentReviews: reviews,
        recentComplaints: complaints,
        hygieneProofs: hygieneProofs,
        statistics: {
          totalReviews: mess.totalReviews,
          totalComplaints: mess.complaintStats?.total || 0,
          resolvedComplaints: mess.complaintStats?.resolved || 0,
          hygieneProofsCount: mess.hygieneStats?.verifiedProofs || 0
        },
        recommendations: mess.getRecommendations ? mess.getRecommendations() : []
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trust dashboard'
    });
  }
};

// Get trust insights and recommendations
export const getTrustInsights = async (req, res) => {
  try {
    const { messId } = req.params;
    
    const insights = await TrustScoreService.getTrustInsights(messId);
    
    res.status(200).json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trust insights'
    });
  }
};

// Get trust history timeline
export const getTrustHistory = async (req, res) => {
  try {
    const { messId } = req.params;
    
    const history = await TrustScoreService.getTrustHistory(messId);
    
    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trust history'
    });
  }
};

// Compare trust scores of multiple messes
export const compareTrustScores = async (req, res) => {
  try {
    const { ids } = req.query;
    
    if (!ids) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mess IDs to compare'
      });
    }
    
    const messIds = ids.split(',');
    const comparisons = await TrustScoreService.compareTrustScores(messIds);
    
    res.status(200).json({
      success: true,
      count: comparisons.length,
      data: comparisons
    });
  } catch (error) {
    console.error('Compare error:', error);
    res.status(500).json({
      success: false,
      message: 'Error comparing trust scores'
    });
  }
};
