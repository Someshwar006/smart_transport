const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/loadController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

// Load Owner routes
router.post('/', authorize('load_owner'), createLoad);
router.get('/my', authorize('load_owner'), getMyLoadsOwner);
router.patch('/:id/owner-assign', authorize('load_owner'), ownerAssignTransporter);
router.patch('/:id/assign-transporter', authorize('load_owner'), ownerAssignTransporter);
router.patch('/:id/revoke-transporter', authorize('load_owner'), revokeTransporterAssignment);
router.patch('/:id/complete', authorize('load_owner'), completeLoad);

// Transporter routes
router.get('/transporter/available', authorize('transporter'), getTransporterAvailableLoads);
router.get('/transporter/my', authorize('transporter'), getTransporterMyLoads);
router.patch('/:id/transporter-accept', authorize('transporter'), transporterExpressInterest);
router.patch('/:id/transporter-willing', authorize('transporter'), transporterExpressInterest);
router.patch('/:id/transporter-assign-driver', authorize('transporter'), transporterAssignDriver);

// Driver routes
router.get('/driver/available', authorize('driver'), getDriverAvailableLoads);
router.get('/driver/my', authorize('driver'), getDriverMyLoads);
router.patch('/:id/driver-accept', authorize('driver'), driverExpressInterest);

// Shared route (single load inspection)
router.get('/:id', getLoadById);

module.exports = router;
