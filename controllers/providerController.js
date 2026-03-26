import Provider from '../models/Provider.js';

// Get all providers
export const getProviders = async (req, res) => {
  try {
    let providers = await Provider.find({ isActive: true })
      .populate('ownerId', 'name email phone')
      .sort('-createdAt');

    // Auto-expiry logic
    const now = new Date();
    let updated = false;

    for (let provider of providers) {
      if (provider.validTill && new Date(provider.validTill) < now && provider.status !== 'unknown') {
        provider.status = 'unknown';
        provider.reason = 'Status expired. Please update.';
        await provider.save();
        updated = true;
      }
    }

    if (updated) {
      providers = await Provider.find({ isActive: true })
        .populate('ownerId', 'name email phone')
        .sort('-createdAt');
    }

    res.status(200).json({
      success: true,
      count: providers.length,
      data: providers
    });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching providers',
      error: error.message
    });
  }
};

// Get single provider
export const getProviderById = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id)
      .populate('ownerId', 'name email phone');

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Auto-expiry check
    const now = new Date();
    if (provider.validTill && new Date(provider.validTill) < now && provider.status !== 'unknown') {
      provider.status = 'unknown';
      provider.reason = 'Status expired. Please update.';
      await provider.save();
    }

    res.status(200).json({
      success: true,
      data: provider
    });
  } catch (error) {
    console.error('Get provider error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching provider',
      error: error.message
    });
  }
};

// Update provider status
export const updateProviderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    console.log('Updating provider status:', { id, status, reason });

    // Validate status
    const validStatuses = ['open', 'closed', 'limited', 'unknown'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: open, closed, limited, unknown'
      });
    }

    const provider = await Provider.findById(id);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Check authorization
    if (provider.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this provider'
      });
    }

    // Update fields
    provider.status = status;
    provider.reason = reason || '';
    provider.lastUpdated = new Date();
    
    // Set expiry time (3 hours from now)
    if (status !== 'unknown') {
      provider.validTill = new Date(Date.now() + 3 * 60 * 60 * 1000);
    } else {
      provider.validTill = null;
    }

    await provider.save();

    res.status(200).json({
      success: true,
      data: provider,
      message: `Provider status updated to ${status}`
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating provider status',
      error: error.message
    });
  }
};