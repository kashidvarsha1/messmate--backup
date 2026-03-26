import HygieneProof from '../models/HygieneProof.js';
import Mess from '../models/Mess.js';  // ← YEH LINE MISSING THI
import TrustScoreService from '../services/trustScoreService.js';

export const uploadHygieneProof = async (req, res) => {
  try {
    const { messId, type, description, mediaUrl, mediaType } = req.body;
    
    // Check if mess exists and user owns it
    const mess = await Mess.findById(messId);
    if (!mess) {
      return res.status(404).json({
        success: false,
        message: 'Mess not found'
      });
    }
    
    if (mess.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload for this mess'
      });
    }

    const hygieneProof = await HygieneProof.create({
      messId,
      ownerId: req.user.id,
      type,
      mediaUrl,
      mediaType,
      description,
      timestamp: new Date()
    });

    // Update trust score
    await TrustScoreService.updateTrustScore(messId);

    res.status(201).json({
      success: true,
      data: hygieneProof,
      message: 'Hygiene proof uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading hygiene proof',
      error: error.message
    });
  }
};

export const getHygieneProofs = async (req, res) => {
  try {
    const { messId } = req.params;
    const proofs = await HygieneProof.find({ messId, verified: true })
      .sort('-timestamp')
      .limit(10);

    res.status(200).json({
      success: true,
      count: proofs.length,
      data: proofs
    });
  } catch (error) {
    console.error('Get proofs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hygiene proofs'
    });
  }
};

export const verifyHygieneProof = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can verify hygiene proofs'
      });
    }

    const proof = await HygieneProof.findById(id);
    if (!proof) {
      return res.status(404).json({
        success: false,
        message: 'Hygiene proof not found'
      });
    }

    proof.verified = true;
    proof.verifiedBy = req.user.id;
    proof.verifiedAt = new Date();
    proof.trustScoreImpact = 10;
    await proof.save();

    await TrustScoreService.updateTrustScore(proof.messId);

    res.status(200).json({
      success: true,
      data: proof,
      message: 'Hygiene proof verified successfully'
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying hygiene proof'
    });
  }
};