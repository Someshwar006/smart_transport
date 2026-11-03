const User = require('../models/User');
const Connection = require('../models/Connection');
const Load = require('../models/Load');

// Helper to mask phone numbers for secure privacy
const maskPhone = (phone) => {
  if (!phone) return 'Not Provided';
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length < 4) return '+91 ••••• ••••';
  const last4 = clean.slice(-4);
  return `+91 ••••• ••${last4}`;
};

// @desc    Get all users with role filter, search, and privacy-preserving phone numbers
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const { role, search, vehicleType, wheelType, permitType } = req.query;
    const currentUserId = req.user._id;

    const query = { _id: { $ne: currentUserId } };

    if (role) {
      query.role = role;
    }

    if (vehicleType) {
      query.vehicleType = vehicleType;
    }

    if (wheelType) {
      query.wheelType = wheelType;
    }

    if (permitType) {
      query.permitType = permitType;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { companyName: searchRegex },
        { headLocation: searchRegex },
        { ceoName: searchRegex },
        { vehicleNumber: searchRegex },
      ];
    }

    // Retrieve all connection records involving the current user
    const userConnections = await Connection.find({
      $or: [{ requester: currentUserId }, { recipient: currentUserId }],
    });

    // Map target user ID to connection status
    const connectionMap = new Map();
    userConnections.forEach((conn) => {
      const otherId =
        conn.requester.toString() === currentUserId.toString()
          ? conn.recipient.toString()
          : conn.requester.toString();

      let status = conn.status;
      if (status === 'pending') {
        status =
          conn.requester.toString() === currentUserId.toString()
            ? 'pending_sent'
            : 'pending_received';
      }

      connectionMap.set(otherId, {
        connectionId: conn._id,
        status,
      });
    });

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    // Apply privacy masking and attach connection status
    const sanitizedUsers = users.map((user) => {
      const userObj = user.toObject();
      const connInfo = connectionMap.get(user._id.toString());
      const isAcceptedConnected = connInfo && connInfo.status === 'accepted';
      const isPublic = user.privacySetting === 'public';

      const showFullPhone = isPublic || isAcceptedConnected;

      return {
        ...userObj,
        phone: showFullPhone ? user.phone : maskPhone(user.phone),
        secondaryPhone: user.secondaryPhone
          ? showFullPhone
            ? user.secondaryPhone
            : maskPhone(user.secondaryPhone)
          : undefined,
        isPhoneMasked: !showFullPhone,
        connectionInfo: connInfo || { connectionId: null, status: 'none' },
      };
    });

    res.status(200).json({ success: true, count: sanitizedUsers.length, users: sanitizedUsers });
  } catch (error) {
    console.error('[Get Users Error]:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch users' });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id).select('-password');
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUserId = req.user._id;
    let showFullPhone = false;

    if (
      currentUserId.toString() === targetUser._id.toString() ||
      targetUser.privacySetting === 'public'
    ) {
      showFullPhone = true;
    } else {
      const mutualConnection = await Connection.findOne({
        $or: [
          { requester: currentUserId, recipient: targetUser._id, status: 'accepted' },
          { requester: targetUser._id, recipient: currentUserId, status: 'accepted' },
        ],
      });
      if (mutualConnection) {
        showFullPhone = true;
      }
    }

    const userObj = targetUser.toObject();
    res.status(200).json({
      success: true,
      user: {
        ...userObj,
        phone: showFullPhone ? targetUser.phone : maskPhone(targetUser.phone),
        secondaryPhone: targetUser.secondaryPhone
          ? showFullPhone
            ? targetUser.secondaryPhone
            : maskPhone(targetUser.secondaryPhone)
          : undefined,
        isPhoneMasked: !showFullPhone,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allowedFields = [
      'name',
      'phone',
      'privacySetting',
      'companyName',
      'headLocation',
      'description',
      'ceoName',
      'secondaryPhone',
      'vehicleNumber',
      'vehicleType',
      'wheelType',
      'permitType',
      'licenseNumber',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    const updatedUser = await user.save();
    const safeUser = updatedUser.toObject();
    delete safeUser.password;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Profile update failed' });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete connections
    await Connection.deleteMany({
      $or: [{ requester: userId }, { recipient: userId }],
    });

    // If load owner, delete loads or mark cancelled
    await Load.deleteMany({ loadOwner: userId });

    // Remove from assigned / willing
    await Load.updateMany(
      { willingTransporters: userId },
      { $pull: { willingTransporters: userId } }
    );
    await Load.updateMany(
      { willingDrivers: userId },
      { $pull: { willingDrivers: userId } }
    );
    await Load.updateMany(
      { assignedTransporter: userId },
      { $set: { assignedTransporter: null, status: 'open' } }
    );
    await Load.updateMany(
      { assignedDriver: userId },
      { $set: { assignedDriver: null, driverAssignmentBadge: 'not_approved' } }
    );

    await User.findByIdAndDelete(userId);

    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Account deletion failed' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateProfile,
  deleteAccount,
};
