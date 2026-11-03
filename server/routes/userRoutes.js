const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateProfile,
  deleteAccount,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/profile', updateProfile);
router.delete('/profile', deleteAccount);

module.exports = router;
