const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'logiconnect_jwt_secret_token_key_2026_production',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user (with dynamic role-specific details)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      privacySetting,
      companyName,
      headLocation,
      description,
      ceoName,
      secondaryPhone,
      vehicleNumber,
      vehicleType,
      wheelType,
      permitType,
      licenseNumber,
    } = req.body;

    if (!name || !email || !password || !role || !phone) {
      return res.status(400).json({
        message: 'Please provide all required fields: name, email, password, role, and phone',
      });
    }

    if (!['load_owner', 'transporter', 'driver'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role selection' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      phone: phone.trim(),
      privacySetting: privacySetting || 'secure',
      companyName: companyName ? companyName.trim() : undefined,
      headLocation: headLocation ? headLocation.trim() : undefined,
      description: description ? description.trim() : undefined,
      ceoName: ceoName ? ceoName.trim() : undefined,
      secondaryPhone: secondaryPhone ? secondaryPhone.trim() : undefined,
      vehicleNumber: vehicleNumber ? vehicleNumber.trim().toUpperCase() : undefined,
      vehicleType: vehicleType || null,
      wheelType: wheelType || null,
      permitType: permitType || null,
      licenseNumber: licenseNumber ? licenseNumber.trim().toUpperCase() : undefined,
    });

    const token = generateToken(user._id, user.role);

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(201).json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('[Register Error]:', error);
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Optional role verification check if user selected a role on login
    if (role && user.role !== role) {
      return res.status(400).json({
        message: `Account is registered as "${user.role.replace('_', ' ')}", not "${role.replace('_', ' ')}". Please switch tabs to log in.`,
      });
    }

    const token = generateToken(user._id, user.role);

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(200).json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    res.status(500).json({ message: error.message || 'Login failed' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe };
