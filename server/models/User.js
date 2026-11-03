const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['load_owner', 'transporter', 'driver'],
        message: '{VALUE} is not a valid role',
      },
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    privacySetting: {
      type: String,
      enum: ['public', 'secure'],
      default: 'secure',
    },
    // Enterprise & Load Owner / Transporter specs
    companyName: {
      type: String,
      trim: true,
    },
    headLocation: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    ceoName: {
      type: String,
      trim: true,
    },
    secondaryPhone: {
      type: String,
      trim: true,
    },
    // Driver-Specific Specifications
    vehicleNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    vehicleType: {
      type: String,
      enum: ['open_tipper', 'box_container', 'flatbed', 'tarpaulin', null],
      default: null,
    },
    wheelType: {
      type: String,
      enum: ['6', '10', '12', '14', '14+', null],
      default: null,
    },
    permitType: {
      type: String,
      enum: ['local', 'state', 'national_permit', 'all_india_permit', null],
      default: null,
    },
    licenseNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
