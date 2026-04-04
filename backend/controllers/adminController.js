import User from '../models/User.js';
import Provider from '../models/Provider.js';
import Report from '../models/Report.js';
import Complaint from '../models/Complaint.js';
import HygieneProof from '../models/HygieneProof.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalProviders,
      activeProviders,
      totalReports,
      pendingReports,
      verifiedReports,
      totalComplaints,
      pendingComplaints,
      totalHygieneProofs,
      pendingHygieneProofs,
      averageScores
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Provider.countDocuments(),
      Provider.countDocuments({ isActive: true }),
      Report.countDocuments(),
      Report.countDocuments({ status: { $in: ['pending', 'investigating'] } }),
      Report.countDocuments({ status: 'verified' }),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: { $in: ['pending', 'investigating', 'escalated'] } }),
      HygieneProof.countDocuments(),
      HygieneProof.countDocuments({ status: 'pending' }),
      Provider.aggregate([
        {
          $group: {
            _id: null,
            averageTrustScore: { $avg: '$trustScore' },
            averageHygieneScore: { $avg: '$hygieneScore' }
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalProviders,
        activeProviders,
        totalReports,
        pendingReports,
        verifiedReports,
        totalComplaints,
        pendingComplaints,
        totalHygieneProofs,
        pendingHygieneProofs,
        averageTrustScore: Number((averageScores[0]?.averageTrustScore || 0).toFixed(1)),
        averageHygieneScore: Number((averageScores[0]?.averageHygieneScore || 0).toFixed(1))
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { search = '' } = req.query;
    const query = {};

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllProviders = async (req, res) => {
  try {
    const { search = '' } = req.query;
    const query = {};

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { 'address.city': { $regex: search.trim(), $options: 'i' } },
        { 'address.state': { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const providers = await Provider.find(query)
      .populate('ownerId', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: providers.length,
      data: providers
    });
  } catch (error) {
    console.error('Admin providers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllComplaints = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    const complaints = await Complaint.find(query)
      .sort('-createdAt')
      .lean();

    const providerIds = complaints.map(complaint => complaint.messId).filter(Boolean);
    const userIds = complaints.map(complaint => complaint.userId).filter(Boolean);

    const [providers, users] = await Promise.all([
      Provider.find({ _id: { $in: providerIds } }).select('name').lean(),
      User.find({ _id: { $in: userIds } }).select('name email').lean()
    ]);

    const providerMap = new Map(providers.map(provider => [String(provider._id), provider]));
    const userMap = new Map(users.map(user => [String(user._id), user]));

    const hydratedComplaints = complaints.map(complaint => ({
      ...complaint,
      providerName: providerMap.get(String(complaint.messId))?.name || 'Unknown Provider',
      reporterName: userMap.get(String(complaint.userId))?.name || 'Unknown User',
      reporterEmail: userMap.get(String(complaint.userId))?.email || ''
    }));

    res.status(200).json({
      success: true,
      count: hydratedComplaints.length,
      data: hydratedComplaints
    });
  } catch (error) {
    console.error('Admin complaints error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
