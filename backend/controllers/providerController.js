import Provider from '../models/Provider.js';

// Socket instances (will be set from server.js)
let io = null;
let activeUsers = new Map();

// Function to set socket instance (called from server.js)
export const setSocketInstance = (socketIo, usersMap) => {
  io = socketIo;
  activeUsers = usersMap;
};

// Create a new provider (mess)
export const createMess = async (req, res) => {
  try {
    // Add owner ID from logged in user
    req.body.ownerId = req.user.id;
    
    const provider = await Provider.create(req.body);
    
    // Send notification to admin (optional)
    if (io) {
      const adminIds = process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',') : [];
      adminIds.forEach(adminId => {
        const adminSocketId = activeUsers.get(adminId);
        if (adminSocketId) {
          io.to(adminSocketId).emit('new_provider', {
            providerId: provider._id,
            providerName: provider.name,
            message: `🏪 New provider registered: "${provider.name}"`
          });
        }
      });
    }
    
    res.status(201).json({
      success: true,
      data: provider,
      message: 'Provider created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating provider'
    });
  }
};

// Get all providers
export const getProviders = async (req, res) => {
  try {
    const {
      search,
      cuisine,
      mealType,
      minPrice,
      maxPrice,
      vegetarian,
      status,
      sortBy = 'newest'
    } = req.query;

    const query = { isActive: true };

    if (search?.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { 'address.city': { $regex: search.trim(), $options: 'i' } },
        { 'address.state': { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (cuisine && cuisine !== 'all') {
      query.cuisineType = {
        $in: cuisine.split(',').map(item => item.trim()).filter(Boolean)
      };
    }

    if (mealType && mealType !== 'all') {
      query.mealTypes = {
        $in: mealType.split(',').map(item => item.trim()).filter(Boolean)
      };
    }

    if (vegetarian === 'true') {
      query.isVegetarian = true;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (minPrice || maxPrice) {
      query.pricePerMeal = {};
      if (minPrice) query.pricePerMeal.$gte = Number(minPrice);
      if (maxPrice) query.pricePerMeal.$lte = Number(maxPrice);
    }

    const sortMap = {
      newest: { createdAt: -1 },
      rating: { averageRating: -1, createdAt: -1 },
      price_asc: { pricePerMeal: 1, createdAt: -1 },
      price_desc: { pricePerMeal: -1, createdAt: -1 },
      hygiene: { hygieneScore: -1, createdAt: -1 }
    };

    const providers = await Provider.find(query)
      .populate('ownerId', 'name phone')
      .sort(sortMap[sortBy] || sortMap.newest);
    
    res.status(200).json({
      success: true,
      count: providers.length,
      data: providers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching providers'
    });
  }
};

// Get single provider
export const getProviderById = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id)
      .populate('ownerId', 'name phone');
    
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
    res.status(500).json({
      success: false,
      message: 'Error fetching provider'
    });
  }
};

// Get provider by publicId (instead of _id)
export const getProviderByPublicId = async (req, res) => {
  try {
    const { publicId } = req.params;
    const provider = await Provider.findOne({ publicId });
    
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    
    res.json(provider);
  } catch (error) {
    console.error('Get provider by publicId error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update provider status with notification
export const updateProviderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

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

    const oldStatus = provider.status;
    provider.status = status;
    provider.reason = reason || '';
    provider.lastUpdated = new Date();
    
    if (status !== 'unknown') {
      provider.validTill = new Date(Date.now() + 3 * 60 * 60 * 1000);
    } else {
      provider.validTill = null;
    }

    await provider.save();

    // Send real-time notification to owner
    if (io) {
      const ownerSocketId = activeUsers.get(provider.ownerId.toString());
      if (ownerSocketId) {
        const statusIcons = {
          open: '🟢',
          closed: '🔴',
          limited: '🟡',
          unknown: '⚪'
        };
        
        io.to(ownerSocketId).emit('status_update', {
          providerId: provider._id,
          providerName: provider.name,
          oldStatus: oldStatus,
          newStatus: status,
          reason: reason,
          message: `${statusIcons[status]} Your provider "${provider.name}" status changed from ${oldStatus?.toUpperCase() || 'UNKNOWN'} to ${status.toUpperCase()}${reason ? ` - Reason: ${reason}` : ''}`
        });
      }
    }

    res.status(200).json({
      success: true,
      data: provider,
      message: `Provider status updated to ${status}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating provider status'
    });
  }
};

// Update provider by publicId
export const updateProviderByPublicId = async (req, res) => {
  try {
    const { publicId } = req.params;
    const updates = req.body;
    
    const provider = await Provider.findOneAndUpdate(
      { publicId },
      updates,
      { new: true, runValidators: true }
    );
    
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    
    res.json(provider);
  } catch (error) {
    console.error('Update provider error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get nearby providers
export const getNearbyProviders = async (req, res) => {
  try {
    const { lat, lng, distance = 5 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude'
      });
    }

    const providers = await Provider.find({
      isActive: true,
      'address.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: distance * 1000
        }
      }
    }).populate('ownerId', 'name phone');

    res.status(200).json({
      success: true,
      count: providers.length,
      data: providers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error finding nearby providers'
    });
  }
};

// Update provider menu
export const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { menu } = req.body;

    const provider = await Provider.findById(id);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    if (provider.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    provider.menu = menu;
    await provider.save();

    res.status(200).json({
      success: true,
      data: provider.menu,
      message: 'Menu updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating menu' });
  }
};

// Get menu for a provider
export const getMenu = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    res.json({ success: true, data: provider.menu || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching menu' });
  }
};

// Add menu item
export const addMenuItem = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    
    // Check authorization
    if (provider.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    provider.menu = provider.menu || [];
    provider.menu.push(req.body);
    await provider.save();
    res.json({ success: true, data: provider.menu });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding menu item' });
  }
};

// Update menu item
export const updateMenuItem = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    
    // Check authorization
    if (provider.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const itemIndex = provider.menu.findIndex(item => item._id.toString() === req.params.itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    provider.menu[itemIndex] = { ...provider.menu[itemIndex], ...req.body };
    await provider.save();
    res.json({ success: true, data: provider.menu });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating menu item' });
  }
};

// Delete menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    
    // Check authorization
    if (provider.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    provider.menu = provider.menu.filter(item => item._id.toString() !== req.params.itemId);
    await provider.save();
    res.json({ success: true, data: provider.menu });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting menu item' });
  }
};
