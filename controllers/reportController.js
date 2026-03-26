import Report from '../models/Report.js';
import Provider from '../models/Provider.js';
import User from '../models/User.js';

export const createReport = async (req, res) => {
  try {
    const { providerId, type, description } = req.body;

    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    const existingReport = await Report.findOne({
      userId: req.user.id,
      providerId,
      type
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this type of report'
      });
    }

    const report = await Report.create({
      userId: req.user.id,
      providerId,
      type,
      description,
      userTrustScore: req.user.userTrustScore || 50
    });

    provider.reportCount = (provider.reportCount || 0) + 1;
    
    if (provider.reportCount >= 3) {
      provider.isUnderReview = true;
      provider.trustScore = Math.max(0, provider.trustScore - 10);
    }
    
    await provider.save();

    res.status(201).json({
      success: true,
      data: report,
      message: 'Report submitted successfully'
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating report',
      error: error.message
    });
  }
};

export const getReportsByProvider = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const reports = await Report.find({ providerId: req.params.providerId })
      .populate('userId', 'name email userTrustScore')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports'
    });
  }
};

export const resolveReport = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { id } = req.params;
    const { adminNote, valid } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.resolved = true;
    report.resolvedAt = new Date();
    report.resolvedBy = req.user.id;
    report.adminNote = adminNote || '';

    await report.save();

    const user = await User.findById(report.userId);
    if (user) {
      if (valid) {
        user.reportsResolved = (user.reportsResolved || 0) + 1;
        user.userTrustScore = Math.min(100, 50 + (user.reportsResolved * 2));
      } else {
        user.userTrustScore = Math.max(0, user.userTrustScore - 5);
      }
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: report,
      message: 'Report resolved successfully'
    });
  } catch (error) {
    console.error('Resolve report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resolving report'
    });
  }
};
