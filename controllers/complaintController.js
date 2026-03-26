import Complaint from '../models/Complaint.js';
import TrustScoreService from '../services/trustScoreService.js';

export const createComplaint = async (req, res) => {
  try {
    const { messId, category, title, description, evidence, priority } = req.body;

    // Check for repeated complaints from same user
    const existingComplaints = await Complaint.find({
      userId: req.user.id,
      messId,
      status: { $ne: 'resolved' }
    });

    const isRepeated = existingComplaints.length > 0;
    const repeatedCount = existingComplaints.length;

    const complaint = await Complaint.create({
      userId: req.user.id,
      messId,
      category,
      title,
      description,
      evidence: evidence || [],
      priority: priority || 'medium',
      isRepeated,
      repeatedCount,
      trustScoreImpact: isRepeated ? -10 : -5
    });

    // Update trust score immediately for serious complaints
    if (priority === 'critical' || priority === 'high') {
      await TrustScoreService.updateTrustScore(messId);
    }

    res.status(201).json({
      success: true,
      data: complaint,
      message: 'Complaint registered successfully'
    });
  } catch (error) {
    console.error('Complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating complaint'
    });
  }
};

export const resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    complaint.status = 'resolved';
    complaint.resolution = resolution;
    complaint.resolvedAt = new Date();
    complaint.resolvedBy = req.user.id;
    await complaint.save();

    // Recalculate trust score (penalty reduced if resolved quickly)
    await TrustScoreService.updateTrustScore(complaint.messId);

    res.status(200).json({
      success: true,
      data: complaint,
      message: 'Complaint resolved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resolving complaint'
    });
  }
};
