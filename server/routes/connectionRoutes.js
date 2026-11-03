const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/connectionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Connection Lifecycle Routes
router.post('/request', sendConnectionRequest || requestConnection);
router.patch('/respond/:connectionId', respondConnectionRequest || respondConnection);
router.patch('/:id/respond', respondConnectionRequest || respondConnection);
router.patch('/:id/accept', acceptConnection);
router.patch('/:id/reject', rejectConnection);
router.delete('/break/:targetUserId', breakConnection);

// Directories & Status Queries
router.get('/directory/:role', getTargetRoleDirectory || getRoleDirectory);
router.get('/status/:targetUserId', getConnectionStatus);
router.get('/requests/incoming', getIncomingRequests);
router.get('/my', getMyConnections);

module.exports = router;
