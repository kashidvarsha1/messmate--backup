import Provider from '../models/Provider.js';

export const getMesses = async (req, res) => {
  try {
    const providers = await Provider.find({ isActive: true })
      .populate('ownerId', 'name email phone')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: providers.length,
      data: providers
    });
  } catch (error) {
    console.error('Get messes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messes',
      error: error.message
    });
  }
};

export const getMessById = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id)
      .populate('ownerId', 'name email phone');
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: provider
    });
  } catch (error) {
    console.error('Get mess error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mess',
      error: error.message
    });
  }
};

export const createMess = async (req, res) => {
  try {
    req.body.ownerId = req.user.id;
    const provider = await Provider.create(req.body);
    res.status(201).json({
      success: true,
      data: provider
    });
  } catch (error) {
    console.error('Create mess error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating mess',
      error: error.message
    });
  }
};

export const updateMess = async (req, res) => {
  try {
    let provider = await Provider.findById(req.params.id);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }
    
    if (provider.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    provider = await Provider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: provider
    });
  } catch (error) {
    console.error('Update mess error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating mess',
      error: error.message
    });
  }
};

export const deleteMess = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }
    
    if (provider.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    await provider.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Provider deleted successfully'
    });
  } catch (error) {
    console.error('Delete mess error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting mess',
      error: error.message
    });
  }
};
