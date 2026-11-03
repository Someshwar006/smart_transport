const mongoose = require('mongoose');
const Connection = require('../models/Connection');
const User = require('../models/User');
const { sendNotificationEmail } = require('../config/nodemailer');

// Returns an array of User IDs that have a mutual 'accepted' connection with the given userId
const getAcceptedConnectedIds = async (userId) => {
  const connections = await Connection.find({
    $or: [{ requester: userId }, { recipient: userId }],
    status: 'accepted',
  });
  return connections.map((conn) =>
    conn.requester.toString() === userId.toString() ? conn.recipient.toString() : conn.requester.toString()
  );
};

const getConnectedUserIds = getAcceptedConnectedIds;

// Phone number masking helper
const maskPhone = (phone) => {
  if (!phone) return 'Not Provided';
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length < 4) return '+91 ••••• ••••';
  const last4 = clean.slice(-4);
  return `+91 ••••• ••${last4}`;
};

// @desc    Send a connection request
// @route   POST /api/connections/request
// @access  Private
const sendConnectionRequest = async (req, res) => {
  try {
    const recipientId = req.body.recipientId || req.body.recipient;
    const requesterId = req.user._id;

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    if (recipientId.toString() === requesterId.toString()) {
      return res.status(400).json({ message: 'You cannot connect with yourself' });
    }

    const recipientUser = await User.findById(recipientId);
    if (!recipientUser) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    // Check existing connection in either direction
    const existing = await Connection.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ message: 'You are already connected with this user' });
      }

      if (existing.status === 'pending') {
        const isSentByMe = existing.requester.toString() === requesterId.toString();
        return res.status(200).json({
          success: true,
          message: isSentByMe
            ? 'A pending connection request is already in progress'
            : 'Incoming request pending from this user',
          connection: existing,
        });
      }

      // If previously in another status, reset to pending
      existing.requester = requesterId;
      existing.recipient = recipientId;
      existing.status = 'pending';
      await existing.save();

      // Trigger email alert
      sendNotificationEmail({
        to: recipientUser.email,
        subject: `New Connection Request on LogiConnect from ${req.user.name}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
            <h2 style="color: #2563eb;">LogiConnect Freight Network</h2>
            <p>Hello <strong>${recipientUser.name}</strong>,</p>
            <p><strong>${req.user.name}</strong> (${req.user.role.replace('_', ' ').toUpperCase()}${req.user.companyName ? ` - ${req.user.companyName}` : ''}) has requested to connect with your logistics profile.</p>
            <p>Connecting allows you to share verified contact numbers, exchange active loads, and assign transport contracts.</p>
            <p style="margin-top: 24px;">Log in to your LogiConnect portal to accept or manage this request.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b;">LogiConnect Logistics Platform • Indian Freight Ecosystem</p>
          </div>
        `,
        text: `${req.user.name} sent you a connection request on LogiConnect.`,
      });

      return res.status(200).json({
        success: true,
        message: 'Connection request dispatched successfully',
        connection: existing,
      });
    }

    const newConnection = await Connection.create({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending',
    });

    // Send email alert to recipient
    sendNotificationEmail({
      to: recipientUser.email,
      subject: `New Connection Request on LogiConnect from ${req.user.name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #2563eb;">LogiConnect Freight Network</h2>
          <p>Hello <strong>${recipientUser.name}</strong>,</p>
          <p><strong>${req.user.name}</strong> (${req.user.role.replace('_', ' ').toUpperCase()}${req.user.companyName ? ` - ${req.user.companyName}` : ''}) has requested to connect with your logistics profile.</p>
          <p>Connecting allows you to share verified contact numbers, exchange active loads, and assign transport contracts.</p>
          <p style="margin-top: 24px;">Log in to your LogiConnect portal to accept or manage this request.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">LogiConnect Logistics Platform • Indian Freight Ecosystem</p>
        </div>
      `,
      text: `${req.user.name} sent you a connection request on LogiConnect.`,
    });

    res.status(201).json({
      success: true,
      message: 'Connection request dispatched successfully',
      connection: newConnection,
    });
  } catch (error) {
    console.error('[Connection Request Error]:', error);
    res.status(500).json({ message: error.message || 'Failed to dispatch connection request' });
  }
};

const requestConnection = sendConnectionRequest;

// @desc    Respond to connection request (accept or ignore)
// @route   PATCH /api/connections/respond/:connectionId OR PATCH /api/connections/:id/respond
// @access  Private
const respondConnectionRequest = async (req, res) => {
  try {
    const connectionId = req.params.connectionId || req.params.id;
    const action =
      req.body.action ||
      (req.body.status === 'accepted' ? 'accept' : req.body.status === 'rejected' ? 'ignore' : null);

    if (!['accept', 'ignore', 'reject'].includes(action)) {
      return res.status(400).json({ message: "Action must be either 'accept' or 'ignore'" });
    }

    const connection = await Connection.findById(connectionId)
      .populate('requester', 'name email role companyName phone secondaryPhone headLocation ceoName vehicleNumber vehicleType wheelType permitType privacySetting')
      .populate('recipient', 'name email role companyName phone secondaryPhone headLocation ceoName vehicleNumber vehicleType wheelType permitType privacySetting');

    if (!connection) {
      return res.status(404).json({ message: 'Connection request not found' });
    }

    // Only the recipient can accept or ignore the request
    if (connection.recipient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the recipient can respond to this connection request' });
    }

    // 1. ACCEPT LIFECYCLE
    if (action === 'accept') {
      connection.status = 'accepted';
      await connection.save();

      // Send confirmation email back to requester
      sendNotificationEmail({
        to: connection.requester.email,
        subject: `Connection Request Accepted by ${req.user.name}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
            <h2 style="color: #059669;">Connection Accepted!</h2>
            <p>Hello <strong>${connection.requester.name}</strong>,</p>
            <p>Great news! <strong>${req.user.name}</strong> has accepted your connection request on LogiConnect.</p>
            <p>You can now view their direct contact numbers, collaborate on loads, and assign transport contracts.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b;">LogiConnect Logistics Platform</p>
          </div>
        `,
        text: `${req.user.name} accepted your connection request on LogiConnect.`,
      });

      // Provide partner details with unmasked information
      const partner =
        connection.requester._id.toString() === req.user._id.toString()
          ? connection.recipient
          : connection.requester;

      return res.status(200).json({
        success: true,
        message: 'Connection request accepted successfully',
        connection,
        partner,
      });
    }

    // 2. IGNORE / ROLLBACK LIFECYCLE: Hard delete the pending record from MongoDB
    await Connection.findByIdAndDelete(connectionId);

    return res.status(200).json({
      success: true,
      message: 'Connection request ignored and deleted',
      connectionId,
    });
  } catch (error) {
    console.error('[Respond Connection Error]:', error);
    res.status(500).json({ message: error.message || 'Failed to respond to connection' });
  }
};

const respondConnection = respondConnectionRequest;

// @desc    Accept connection request (Alias for /:id/accept)
// @route   PATCH /api/connections/:id/accept
// @access  Private
const acceptConnection = async (req, res) => {
  req.body.action = 'accept';
  return respondConnectionRequest(req, res);
};

// @desc    Reject / Ignore connection request (Alias for /:id/reject)
// @route   PATCH /api/connections/:id/reject
// @access  Private
const rejectConnection = async (req, res) => {
  req.body.action = 'ignore';
  return respondConnectionRequest(req, res);
};

// @desc    Break / Delete an existing connection
// @route   DELETE /api/connections/break/:targetUserId
// @access  Private
const breakConnection = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const currentUserId = req.user._id;

    if (!targetUserId) {
      return res.status(400).json({ message: 'Target user ID is required' });
    }

    // Find and delete the mutual connection record
    let deleted = await Connection.findOneAndDelete({
      $or: [
        { requester: currentUserId, recipient: targetUserId },
        { requester: targetUserId, recipient: currentUserId },
      ],
    });

    // Fallback: If targetUserId was passed as the connection ObjectId itself
    if (!deleted && mongoose.Types.ObjectId.isValid(targetUserId)) {
      deleted = await Connection.findOneAndDelete({
        _id: targetUserId,
        $or: [{ requester: currentUserId }, { recipient: currentUserId }],
      });
    }

    if (!deleted) {
      return res.status(404).json({ message: 'Connection record not found or already deleted' });
    }

    res.status(200).json({
      success: true,
      message: 'Connection broken successfully. Users returned to explore pool.',
      targetUserId,
    });
  } catch (error) {
    console.error('[Break Connection Error]:', error);
    res.status(500).json({ message: error.message || 'Failed to break connection' });
  }
};

// @desc    Get segregated role directory (connected vs explore with state lifecycle)
// @route   GET /api/connections/directory/:role
// @access  Private
const getTargetRoleDirectory = async (req, res) => {
  try {
    const currentUserId = req.user._id ? req.user._id.toString() : req.user.id.toString();
    const targetRole = req.params.role;

    // 1. Fetch all users matching target role (excluding logged-in user)
    const users = await User.find({ role: targetRole, _id: { $ne: currentUserId } })
      .select('-password')
      .lean();

    // 2. Fetch all connections involving current user
    const connections = await Connection.find({
      $or: [{ requester: currentUserId }, { recipient: currentUserId }],
    }).lean();

    const connectionMap = {};
    connections.forEach((conn) => {
      const isRequester = conn.requester.toString() === currentUserId;
      const otherPartyId = isRequester ? conn.recipient.toString() : conn.requester.toString();
      connectionMap[otherPartyId] = {
        connectionId: conn._id,
        status: conn.status,
        isRequester,
      };
    });

    const connected = [];
    const incomingRequests = [];
    const explore = [];

    users.forEach((user) => {
      const connInfo = connectionMap[user._id.toString()];

      if (connInfo && connInfo.status === 'accepted') {
        // STATE 3: ACCEPTED
        // Strictly displayed in Connected Tab ONLY (removed from Explore tab)
        connected.push({
          ...user,
          connectionId: connInfo.connectionId,
          connectionState: 'accepted',
          connectionStatus: 'accepted',
          isPhoneMasked: false, // Connected users view full verified details
        });
      } else {
        // Candidate is displayed in Explore Tab
        let connectionState = 'idle';
        let connectionStatus = 'none';

        if (connInfo && connInfo.status === 'pending') {
          if (connInfo.isRequester) {
            // STATE 2A: PENDING SENDER VIEW -> "Processing..."
            connectionState = 'processing';
            connectionStatus = 'pending_sent';
          } else {
            // STATE 2B: PENDING RECEIVER VIEW -> "Accept" / "Ignore"
            connectionState = 'received_pending';
            connectionStatus = 'pending_received';

            // Also include in incoming requests array for the top notification banner
            incomingRequests.push({
              ...user,
              connectionId: connInfo.connectionId,
              connectionState: 'received_pending',
              connectionStatus: 'pending_received',
              isPhoneMasked: true,
              phone: maskPhone(user.phone),
            });
          }
        }

        explore.push({
          ...user,
          connectionId: connInfo ? connInfo.connectionId : null,
          connectionState,
          connectionStatus,
          isPhoneMasked: true, // Always masked in Explore tab
          phone: maskPhone(user.phone),
          secondaryPhone: user.secondaryPhone ? maskPhone(user.secondaryPhone) : undefined,
        });
      }
    });

    res.status(200).json({
      success: true,
      connected,
      incomingRequests,
      explore,
    });
  } catch (error) {
    console.error('[Get Role Directory Error]:', error);
    res.status(500).json({ message: 'Error fetching directory', error: error.message });
  }
};

const getRoleDirectory = getTargetRoleDirectory;

// @desc    Get connection status between logged-in user and a target user
// @route   GET /api/connections/status/:targetUserId
// @access  Private
const getConnectionStatus = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const currentUserId = req.user._id;

    if (targetUserId.toString() === currentUserId.toString()) {
      return res.status(200).json({ success: true, status: 'self', connectionState: 'self' });
    }

    const conn = await Connection.findOne({
      $or: [
        { requester: currentUserId, recipient: targetUserId },
        { requester: targetUserId, recipient: currentUserId },
      ],
    });

    if (!conn) {
      return res.status(200).json({
        success: true,
        status: 'none',
        connectionState: 'idle',
        connectionId: null,
      });
    }

    let status = conn.status;
    let connectionState = 'idle';

    if (status === 'accepted') {
      connectionState = 'accepted';
    } else if (status === 'pending') {
      const isSender = conn.requester.toString() === currentUserId.toString();
      status = isSender ? 'pending_sent' : 'pending_received';
      connectionState = isSender ? 'processing' : 'received_pending';
    }

    res.status(200).json({
      success: true,
      status,
      connectionState,
      connectionId: conn._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to get connection status' });
  }
};

// @desc    Get all pending incoming connection requests for current user
// @route   GET /api/connections/requests/incoming
// @access  Private
const getIncomingRequests = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const requests = await Connection.find({
      recipient: currentUserId,
      status: 'pending',
    })
      .populate('requester', 'name email companyName phone secondaryPhone role headLocation ceoName vehicleNumber vehicleType wheelType permitType privacySetting')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch incoming requests' });
  }
};

// @desc    Get all connections for current user
// @route   GET /api/connections/my
// @access  Private
const getMyConnections = async (req, res) => {
  try {
    const userId = req.user._id;

    const connections = await Connection.find({
      $or: [{ requester: userId }, { recipient: userId }],
    })
      .populate('requester', 'name email role phone secondaryPhone privacySetting companyName headLocation vehicleNumber vehicleType wheelType permitType')
      .populate('recipient', 'name email role phone secondaryPhone privacySetting companyName headLocation vehicleNumber vehicleType wheelType permitType')
      .sort({ updatedAt: -1 });

    const accepted = [];
    const pendingSent = [];
    const pendingReceived = [];

    connections.forEach((conn) => {
      const isRequester = conn.requester._id.toString() === userId.toString();
      const partner = isRequester ? conn.recipient : conn.requester;

      const formatted = {
        _id: conn._id,
        partner,
        status: conn.status,
        createdAt: conn.createdAt,
        updatedAt: conn.updatedAt,
      };

      if (conn.status === 'accepted') {
        accepted.push(formatted);
      } else if (conn.status === 'pending') {
        if (isRequester) {
          pendingSent.push(formatted);
        } else {
          pendingReceived.push(formatted);
        }
      }
    });

    res.status(200).json({
      success: true,
      totalConnected: accepted.length,
      accepted,
      pendingSent,
      pendingReceived,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch connections' });
  }
};

module.exports = {
  getAcceptedConnectedIds,
  getConnectedUserIds,
  sendConnectionRequest,
  requestConnection,
  respondConnectionRequest,
  respondConnection,
  acceptConnection,
  rejectConnection,
  breakConnection,
  getTargetRoleDirectory,
  getRoleDirectory,
  getConnectionStatus,
  getIncomingRequests,
  getMyConnections,
};
