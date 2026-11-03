const Load = require('../models/Load');
const Connection = require('../models/Connection');
const User = require('../models/User');
const { sendNotificationEmail } = require('../config/nodemailer');
const { getConnectedUserIds } = require('./connectionController');

// @desc    Create a new load
// @route   POST /api/loads
// @access  Private (Load Owner only)
const createLoad = async (req, res) => {
  try {
    const {
      loadName,
      category,
      weight,
      loadPackType,
      fromLocation,
      toLocation,
      requiredVehicleType,
      requiredWheelType,
      requiredPermitType,
      amountType,
      priceRate,
      imageUrl,
      description,
    } = req.body;

    if (!loadName || !weight || !fromLocation || !toLocation || !requiredVehicleType || !requiredWheelType || !priceRate) {
      return res.status(400).json({
        message: 'Please provide all required load specifications (name, weight, pickup, delivery, vehicle, wheels, price rate)',
      });
    }

    const load = await Load.create({
      loadOwner: req.user._id,
      loadName: loadName.trim(),
      category: category || 'Industrial',
      weight: Number(weight),
      loadPackType: loadPackType || 'closed',
      fromLocation,
      toLocation,
      requiredVehicleType,
      requiredWheelType,
      requiredPermitType: requiredPermitType || 'all_india_permit',
      amountType: amountType || 'advance_plus_balance',
      priceRate: Number(priceRate),
      imageUrl: imageUrl || '',
      description: description ? description.trim() : '',
      status: 'open',
      driverAssignmentBadge: 'not_approved',
      willingTransporters: [],
      assignedTransporter: null,
      willingDrivers: [],
      assignedDriver: null,
    });

    const populatedLoad = await Load.findById(load._id).populate('loadOwner', 'name companyName headLocation phone email');

    res.status(201).json({
      success: true,
      message: 'Load created successfully and open for connected transporters',
      load: populatedLoad,
    });
  } catch (error) {
    console.error('[Create Load Error]:', error);
    res.status(500).json({ message: error.message || 'Failed to create load' });
  }
};

// @desc    Get loads for Load Owner (with tabs & transporter filtering)
// @route   GET /api/loads/my
// @access  Private (Load Owner)
const getMyLoadsOwner = async (req, res) => {
  try {
    const { status, transporterId } = req.query;
    const query = { loadOwner: req.user._id };

    if (status) {
      query.status = status;
    }

    if (transporterId) {
      query.assignedTransporter = transporterId;
    }

    const loads = await Load.find(query)
      .populate('willingTransporters', 'name companyName headLocation phone secondaryPhone ceoName privacySetting')
      .populate('assignedTransporter', 'name companyName headLocation phone secondaryPhone ceoName privacySetting')
      .populate('assignedDriver', 'name phone vehicleNumber vehicleType wheelType permitType licenseNumber privacySetting')
      .populate('willingDrivers', 'name phone vehicleNumber vehicleType wheelType permitType licenseNumber privacySetting')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: loads.length, loads });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch loads' });
  }
};

// @desc    Get available open loads for Transporter (from connected Load Owners only)
// @route   GET /api/loads/transporter/available
// @access  Private (Transporter)
const getTransporterAvailableLoads = async (req, res) => {
  try {
    // Crucial Scope: Matches ONLY loads where loadOwner is in Transporter's accepted connected Load Owners
    const connectedOwnerIds = await getConnectedUserIds(req.user._id);

    if (!connectedOwnerIds || connectedOwnerIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        loads: [],
      });
    }

    const loads = await Load.find({
      status: 'open',
      loadOwner: { $in: connectedOwnerIds },
    })
      .populate('loadOwner', 'name companyName headLocation phone privacySetting')
      .populate('willingTransporters', '_id')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: loads.length,
      loads,
    });
  } catch (error) {
    console.error('[Get Available Transporter Loads Error]:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch available loads' });
  }
};

// @desc    Get Transporter's progressing & completed loads
// @route   GET /api/loads/transporter/my
// @access  Private (Transporter)
const getTransporterMyLoads = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { assignedTransporter: req.user._id };

    if (status) {
      query.status = status;
    }

    const loads = await Load.find(query)
      .populate('loadOwner', 'name companyName headLocation phone email privacySetting')
      .populate('willingDrivers', 'name phone vehicleNumber vehicleType wheelType permitType licenseNumber privacySetting')
      .populate('assignedDriver', 'name phone vehicleNumber vehicleType wheelType permitType licenseNumber privacySetting')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: loads.length, loads });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch loads' });
  }
};

// @desc    Transporter expresses interest / accepts open load
// @route   PATCH /api/loads/:id/transporter-willing or /transporter-accept
// @access  Private (Transporter)
const transporterExpressInterest = async (req, res) => {
  try {
    const loadId = req.params.id;
    const transporterId = req.user._id;

    const load = await Load.findById(loadId).populate('loadOwner', 'name email companyName');
    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }

    if (load.status !== 'open') {
      return res.status(400).json({ message: 'This load is no longer open for bids' });
    }

    // Verify calling Transporter has an accepted connection with the load's loadOwner
    const connectedOwnerIds = await getConnectedUserIds(transporterId);
    const isConnectedWithOwner = connectedOwnerIds.some(
      (id) => id.toString() === load.loadOwner._id.toString()
    );

    if (!isConnectedWithOwner) {
      return res.status(403).json({
        message: 'You can only express interest on loads from Load Owners you have an accepted connection with.',
      });
    }

    // Add req.user._id using $addToSet to prevent duplicates
    const updatedLoad = await Load.findByIdAndUpdate(
      loadId,
      { $addToSet: { willingTransporters: transporterId } },
      { new: true }
    );

    // Trigger email notification to Load Owner
    if (load.loadOwner?.email) {
      sendNotificationEmail({
        to: load.loadOwner.email,
        subject: `New Transporter Interest for Load: ${load.loadName}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
            <h2 style="color: #2563eb;">Transporter Interested in Your Freight!</h2>
            <p>Hello <strong>${load.loadOwner.name}</strong>,</p>
            <p>Transporter <strong>${req.user.name}</strong> (${req.user.companyName || 'Verified Fleet Agency'}) has expressed interest / accepted your load <strong>"${load.loadName}"</strong> (${load.weight} Tons, ${load.fromLocation.city} to ${load.toLocation.city}).</p>
            <p>Visit your <strong>My Loads > Open Loads</strong> tab to view interested transporters and assign the contract.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b;">LogiConnect Freight Platform</p>
          </div>
        `,
        text: `Transporter ${req.user.name} expressed interest in your load "${load.loadName}".`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Interest registered successfully. The load owner has been notified.',
      load: updatedLoad,
    });
  } catch (error) {
    console.error('[Transporter Accept Error]:', error);
    res.status(500).json({ message: error.message || 'Failed to express interest' });
  }
};

// @desc    Load Owner assigns Transporter from willingTransporters
// @route   PATCH /api/loads/:id/assign-transporter or /owner-assign
// @access  Private (Load Owner)
const ownerAssignTransporter = async (req, res) => {
  try {
    const loadId = req.params.id;
    const { transporterId } = req.body;

    if (!transporterId) {
      return res.status(400).json({ message: 'Transporter ID is required' });
    }

    const load = await Load.findById(loadId);
    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }

    if (load.loadOwner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: Only the load owner can assign a transporter' });
    }

    const transporter = await User.findById(transporterId);
    if (!transporter) {
      return res.status(404).json({ message: 'Transporter not found' });
    }

    load.assignedTransporter = transporterId;
    load.status = 'in_progress';
    load.willingTransporters = []; // Cleared so it vanishes from others' open feeds
    load.driverAssignmentBadge = 'not_approved';
    await load.save();

    // Email notification to assigned Transporter
    sendNotificationEmail({
      to: transporter.email,
      subject: `Contract Awarded: You are Assigned to Load "${load.loadName}"`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #2563eb;">Freight Contract Awarded!</h2>
          <p>Hello <strong>${transporter.name}</strong>,</p>
          <p><strong>${req.user.name}</strong> has chosen your agency to transport <strong>"${load.loadName}"</strong> (${load.weight} Tons, ${load.fromLocation.city} to ${load.toLocation.city}).</p>
          <p>Budget: <strong>₹${load.priceRate.toLocaleString('en-IN')}</strong> (${load.amountType.replace('_', ' ')})</p>
          <p>Please open your <strong>Progressing Loads</strong> tab to assign a verified driver and turn this shipment Live!</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">LogiConnect Transport Platform</p>
        </div>
      `,
      text: `You have been assigned to transport load "${load.loadName}" by ${req.user.name}.`,
    });

    const updatedLoad = await Load.findById(loadId)
      .populate('assignedTransporter', 'name companyName headLocation phone ceoName')
      .populate('assignedDriver', 'name phone vehicleNumber vehicleType wheelType permitType');

    res.status(200).json({
      success: true,
      message: 'Transporter assigned successfully. Load moved to in_progress.',
      load: updatedLoad,
    });
  } catch (error) {
    console.error('[Owner Assign Transporter Error]:', error);
    res.status(500).json({ message: error.message || 'Failed to assign transporter' });
  }
};

// @desc    Revoke Transporter Assignment ("Delete Assigning")
// @route   PATCH /api/loads/:id/revoke-transporter
// @access  Private (Load Owner)
const revokeTransporterAssignment = async (req, res) => {
  try {
    const loadId = req.params.id;

    const load = await Load.findOne({ _id: loadId, loadOwner: req.user._id });
    if (!load) {
      return res.status(404).json({ message: 'Load not found or unauthorized' });
    }

    if (load.status === 'completed') {
      return res.status(400).json({ message: 'Cannot revoke assignment for a completed load' });
    }

    // Reset fields atomically
    load.assignedTransporter = null;
    load.assignedDriver = null;
    load.driverAssignmentBadge = 'not_approved';
    load.status = 'open';
    load.willingTransporters = [];
    load.willingDrivers = [];

    await load.save();

    res.status(200).json({
      success: true,
      message: 'Assignment revoked. Load is now back to Open status.',
      load,
    });
  } catch (error) {
    console.error('[Revoke Transporter Error]:', error);
    res.status(500).json({ message: error.message || 'Failed to revoke transporter assignment' });
  }
};

// @desc    Get Driver available loads (in_progress, unassigned driver, assigned to connected transporter)
// @route   GET /api/loads/driver/available
// @access  Private (Driver)
const getDriverAvailableLoads = async (req, res) => {
  try {
    // Matches ONLY loads where assignedTransporter is in the Driver's list of accepted connected Transporters
    const connectedTransporterIds = await getConnectedUserIds(req.user._id);

    if (!connectedTransporterIds || connectedTransporterIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        loads: [],
      });
    }

    const loads = await Load.find({
      status: 'in_progress',
      assignedDriver: null,
      assignedTransporter: { $in: connectedTransporterIds },
    })
      .populate('loadOwner', 'name companyName headLocation')
      .populate('assignedTransporter', 'name companyName headLocation phone')
      .populate('willingDrivers', '_id')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: loads.length,
      loads,
    });
  } catch (error) {
    console.error('[Get Driver Available Loads Error]:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch available driver loads' });
  }
};

// @desc    Get Driver's assigned / progressing & completed loads
// @route   GET /api/loads/driver/my
// @access  Private (Driver)
const getDriverMyLoads = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { assignedDriver: req.user._id };

    if (status) {
      query.status = status;
    }

    const loads = await Load.find(query)
      .populate('loadOwner', 'name companyName headLocation phone email')
      .populate('assignedTransporter', 'name companyName headLocation phone secondaryPhone ceoName')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: loads.length, loads });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch driver loads' });
  }
};

// @desc    Driver expresses interest ("Accept / Willing")
// @route   PATCH /api/loads/:id/driver-accept
// @access  Private (Driver)
const driverExpressInterest = async (req, res) => {
  try {
    const loadId = req.params.id;
    const driverId = req.user._id;

    const load = await Load.findById(loadId).populate('assignedTransporter', 'name email companyName');
    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }

    if (load.status !== 'in_progress' || load.assignedDriver) {
      return res.status(400).json({ message: 'This load is not currently awaiting driver assignment' });
    }

    // Verify driver is connected with the load's assignedTransporter
    const connectedTransporterIds = await getConnectedUserIds(driverId);
    const isConnectedWithTransporter = connectedTransporterIds.some(
      (id) => id.toString() === load.assignedTransporter?._id.toString()
    );

    if (!isConnectedWithTransporter) {
      return res.status(403).json({
        message: 'You can only express interest on loads from Transporters you have an accepted connection with.',
      });
    }

    // Atomically add driverId using $addToSet to prevent duplicates
    const updatedLoad = await Load.findByIdAndUpdate(
      loadId,
      { $addToSet: { willingDrivers: driverId } },
      { new: true }
    );

    // Notify assigned transporter
    if (load.assignedTransporter?.email) {
      sendNotificationEmail({
        to: load.assignedTransporter.email,
        subject: `Driver Available for Load: ${load.loadName}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
            <h2 style="color: #7c3aed;">Driver Ready to Dispatch!</h2>
            <p>Hello <strong>${load.assignedTransporter.name}</strong>,</p>
            <p>Driver <strong>${req.user.name}</strong> (${req.user.vehicleNumber || 'Registered Vehicle'}, ${req.user.vehicleType}) has clicked <strong>"Willing"</strong> to carry your load <strong>"${load.loadName}"</strong>.</p>
            <p>Go to your Transporter Dashboard to confirm assignment and mark shipment Live!</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b;">LogiConnect Transport Platform</p>
          </div>
        `,
        text: `Driver ${req.user.name} marked willing for load "${load.loadName}".`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Marked as willing. Transporter has been notified.',
      load: updatedLoad,
    });
  } catch (error) {
    console.error('[Driver Accept Error]:', error);
    res.status(500).json({ message: error.message || 'Failed to mark willing' });
  }
};

// @desc    Transporter assigns Driver from willingDrivers (or connected drivers)
// @route   PATCH /api/loads/:id/transporter-assign-driver
// @access  Private (Transporter)
const transporterAssignDriver = async (req, res) => {
  try {
    const loadId = req.params.id;
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({ message: 'Driver ID is required' });
    }

    const load = await Load.findOne({
      _id: loadId,
      assignedTransporter: req.user._id,
    });

    if (!load) {
      return res.status(404).json({ message: 'Load not found or not assigned to you' });
    }

    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ message: 'Valid driver not found' });
    }

    load.assignedDriver = driverId;
    load.driverAssignmentBadge = 'live'; // Atomically updates to 'live'
    load.willingDrivers = []; // Clear other willing drivers
    await load.save();

    // Send notification email to driver
    sendNotificationEmail({
      to: driver.email,
      subject: `Load Dispatched: You are Assigned to "${load.loadName}"`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #059669;">Your Load is LIVE on Road!</h2>
          <p>Hello <strong>${driver.name}</strong>,</p>
          <p>Transporter <strong>${req.user.name}</strong> has confirmed you as the driver for <strong>"${load.loadName}"</strong> (${load.fromLocation.city} to ${load.toLocation.city}).</p>
          <p>Pickup: ${load.fromLocation.address || ''}, ${load.fromLocation.city}, ${load.fromLocation.state}</p>
          <p>Drop: ${load.toLocation.address || ''}, ${load.toLocation.city}, ${load.toLocation.state}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">LogiConnect Freight Platform • Drive Safely!</p>
        </div>
      `,
      text: `You have been assigned as driver for load "${load.loadName}".`,
    });

    const updatedLoad = await Load.findById(loadId)
      .populate('loadOwner', 'name companyName phone')
      .populate('assignedTransporter', 'name companyName phone')
      .populate('assignedDriver', 'name phone vehicleNumber vehicleType wheelType permitType licenseNumber');

    res.status(200).json({
      success: true,
      message: 'Driver assigned successfully. Shipment status is now LIVE.',
      load: updatedLoad,
    });
  } catch (error) {
    console.error('[Transporter Assign Driver Error]:', error);
    res.status(500).json({ message: error.message || 'Failed to assign driver' });
  }
};

// @desc    Mark load as completed ("Received / Recovered")
// @route   PATCH /api/loads/:id/complete
// @access  Private (Load Owner)
const completeLoad = async (req, res) => {
  try {
    const loadId = req.params.id;

    const load = await Load.findOne({
      _id: loadId,
      loadOwner: req.user._id,
    })
      .populate('assignedTransporter', 'name email companyName')
      .populate('assignedDriver', 'name email');

    if (!load) {
      return res.status(404).json({ message: 'Load not found or unauthorized' });
    }

    if (load.status === 'completed') {
      return res.status(400).json({ message: 'Load is already marked as completed' });
    }

    load.status = 'completed';
    await load.save();

    // Notify Transporter
    if (load.assignedTransporter?.email) {
      sendNotificationEmail({
        to: load.assignedTransporter.email,
        subject: `Delivery Confirmed: "${load.loadName}" Recovered / Received`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
            <h2 style="color: #059669;">Delivery Completed & Verified!</h2>
            <p>Hello <strong>${load.assignedTransporter.name}</strong>,</p>
            <p>The load owner <strong>${req.user.name}</strong> has confirmed safe receipt of <strong>"${load.loadName}"</strong>.</p>
            <p>Payment terms (${load.amountType.replace('_', ' ')}) can now be finalized.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b;">LogiConnect Transport Platform</p>
          </div>
        `,
        text: `Load "${load.loadName}" has been marked as received and completed.`,
      });
    }

    // Notify Driver
    if (load.assignedDriver?.email) {
      sendNotificationEmail({
        to: load.assignedDriver.email,
        subject: `Delivery Acknowledged: "${load.loadName}" Completed`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
            <h2 style="color: #059669;">Safe Trip Acknowledged!</h2>
            <p>Hello <strong>${load.assignedDriver.name}</strong>,</p>
            <p>The load <strong>"${load.loadName}"</strong> has been successfully received by the cargo owner. Thank you for your service!</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b;">LogiConnect Transport Platform</p>
          </div>
        `,
        text: `Trip for load "${load.loadName}" marked completed.`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Load marked as completed and verified.',
      load,
    });
  } catch (error) {
    console.error('[Complete Load Error]:', error);
    res.status(500).json({ message: error.message || 'Failed to complete load' });
  }
};

// @desc    Get single load details
// @route   GET /api/loads/:id
// @access  Private
const getLoadById = async (req, res) => {
  try {
    const load = await Load.findById(req.params.id)
      .populate('loadOwner', 'name companyName headLocation phone email privacySetting')
      .populate('willingTransporters', 'name companyName headLocation phone ceoName')
      .populate('assignedTransporter', 'name companyName headLocation phone ceoName')
      .populate('willingDrivers', 'name phone vehicleNumber vehicleType wheelType permitType')
      .populate('assignedDriver', 'name phone vehicleNumber vehicleType wheelType permitType licenseNumber');

    if (!load) {
      return res.status(404).json({ message: 'Load not found' });
    }

    res.status(200).json({ success: true, load });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch load details' });
  }
};

module.exports = {
  createLoad,
  getMyLoadsOwner,
  getTransporterAvailableLoads,
  getTransporterMyLoads,
  transporterExpressInterest,
  ownerAssignTransporter,
  revokeTransporterAssignment,
  getDriverAvailableLoads,
  getDriverMyLoads,
  driverExpressInterest,
  transporterAssignDriver,
  completeLoad,
  getLoadById,
};
