import Report from '../models/Report.js';
import Provider from '../models/Provider.js';
import User from '../models/User.js';
import HygieneScoreService from '../services/hygieneScoreService.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

// Submit a report
export const createReport = catchAsync(async (req, res) => {
  const { providerId, category, subCategory, title, description, evidence, severity } = req.body;

  const provider = await Provider.findById(providerId).catch(() => null) || await Provider.findOne({ publicId: providerId });
  if (!provider) {
    throw new AppError('Provider not found', 404);
  }

  const normalizedProviderId = provider._id;

  const existingReport = await Report.findOne({
    userId: req.user.id,
    providerId: normalizedProviderId
  });

  if (existingReport) {
    throw new AppError('Aap ek provider par sirf ek hi report submit kar sakte ho.', 400);
  }

  const report = await Report.create({
    userId: req.user.id,
    providerId: normalizedProviderId,
    category,
    subCategory,
    title,
    description,
    evidence: evidence || [],
    severity: severity || 'medium',
    status: 'verified',
    resolvedAt: new Date(),
    resolvedBy: req.user.id
  });

  provider.totalComplaints = (provider.totalComplaints || 0) + 1;
  await provider.save();

  res.status(201).json({
    success: true,
    data: report,
    message: 'Report submitted and verified successfully!'
  });
});

// Get reports by current user (users can only see their own reports)
export const getMyReports = catchAsync(async (req, res) => {
  const reports = await Report.find({ userId: req.user.id })
    .populate('providerId', 'name pricePerMeal status address')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: reports.length,
    data: reports
  });
});

// Get reports for a provider (admin only)
export const getProviderReports = catchAsync(async (req, res) => {
  const { providerId } = req.params;

  const provider =
    await Provider.findById(providerId).catch(() => null) ||
    await Provider.findOne({ publicId: providerId });

  if (!provider) {
    throw new AppError('Provider not found', 404);
  }

  if (req.user.role !== 'admin' && provider.ownerId.toString() !== req.user.id) {
    throw new AppError('Only the owner or admin can view these reports', 403);
  }

  const reports = await Report.find({ providerId: provider._id })
    .populate('userId', req.user.role === 'admin' ? 'name email' : 'name')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: reports.length,
    data: reports
  });
});

// Get all reports (admin only)
export const getAllReports = catchAsync(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new AppError('Only admins can view reports', 403);
  }

  const { status, category, severity, page = 1, limit = 20 } = req.query;
  
  let query = {};
  if (status) query.status = status;
  if (category) query.category = category;
  if (severity) query.severity = severity;

  const reports = await Report.find(query)
    .populate('userId', 'name email')
    .populate('providerId', 'name')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Report.countDocuments(query);

  res.status(200).json({
    success: true,
    count: reports.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: reports
  });
});

// Verify report (admin only)
export const verifyReport = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, adminNote } = req.body;
  const allowedStatuses = ['investigating', 'verified', 'dismissed', 'resolved'];

  if (req.user.role !== 'admin') {
    throw new AppError('Only admins can verify reports', 403);
  }

  if (!allowedStatuses.includes(status)) {
    throw new AppError('Invalid report status', 400);
  }

  const report = await Report.findById(id);
  if (!report) {
    throw new AppError('Report not found', 404);
  }

  report.status = status;
  report.adminNote = adminNote || report.adminNote;

  if (status === 'verified' || status === 'dismissed' || status === 'resolved') {
    report.resolvedAt = new Date();
    report.resolvedBy = req.user.id;
  } else {
    report.resolvedAt = undefined;
    report.resolvedBy = undefined;
  }

  await report.save();
  await HygieneScoreService.updateHygieneScore(report.providerId);

  res.status(200).json({
    success: true,
    data: report,
    message: `Report ${status} successfully`
  });
});

// Get public complaint summary for a provider
export const getPublicProviderReports = catchAsync(async (req, res) => {
  const { providerId } = req.params;
  const provider =
    await Provider.findById(providerId).catch(() => null) ||
    await Provider.findOne({ publicId: providerId });

  if (!provider) {
    throw new AppError('Provider not found', 404);
  }

  const normalizedProviderId = provider._id;
  const publicQuery = {
    providerId: normalizedProviderId,
    status: { $in: ['verified', 'investigating', 'resolved'] }
  };

  const reports = await Report.find(publicQuery)
    .populate('userId', 'name')
    .select('category severity status createdAt title evidence userId')
    .sort('-createdAt')
    .limit(100);

  const total = await Report.countDocuments(publicQuery);
  const verified = await Report.countDocuments({
    providerId: normalizedProviderId,
    status: { $in: ['verified', 'resolved'] }
  });
  const underReview = await Report.countDocuments({
    providerId: normalizedProviderId,
    status: 'investigating'
  });

  res.status(200).json({
    success: true,
    count: reports.length,
    total,
    verified,
    underReview,
    data: reports
  });
});

