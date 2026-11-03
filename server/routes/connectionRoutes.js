const express = require('express');
const router = express.Router();
const {
  requestConnection,
  respondConnection,
  acceptConnection,
  rejectConnection,
  getConnectionStatus,
  getIncomingRequests,
  getMyConnections,
  getRoleDirectory,
} = require('../controllers/connectionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/request', requestConnection);
router.patch('/:id/respond', respondConnection);
router.patch('/:id/accept', acceptConnection);
router.patch('/:id/reject', rejectConnection);
router.get('/directory/:role', getRoleDirectory);
router.get('/status/:targetUserId', getConnectionStatus);
router.get('/requests/incoming', getIncomingRequests);
router.get('/my', getMyConnections);

module.exports = router;
