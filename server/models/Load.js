const mongoose = require('mongoose');

const loadSchema = new mongoose.Schema(
  {
    loadOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Load Owner is required'],
    },
    loadName: {
      type: String,
      required: [true, 'Load name/title is required'],
      trim: true,
    },
    category: {
      type: String,
      default: 'Industrial',
      trim: true,
    },
    weight: {
      type: Number,
      required: [true, 'Weight is required (in Tons)'],
    },
    loadPackType: {
      type: String,
      enum: ['open', 'closed', 'palletized', 'loose'],
      default: 'closed',
    },
    fromLocation: {
      address: { type: String, default: '' },
      city: { type: String, required: [true, 'Pickup city is required'] },
      state: { type: String, required: [true, 'Pickup state is required'] },
      pincode: { type: String, default: '' },
    },
    toLocation: {
      address: { type: String, default: '' },
      city: { type: String, required: [true, 'Delivery city is required'] },
      state: { type: String, required: [true, 'Delivery state is required'] },
      pincode: { type: String, default: '' },
    },
    requiredVehicleType: {
      type: String,
      enum: ['open_tipper', 'box_container', 'flatbed', 'tarpaulin'],
      required: [true, 'Required vehicle body type is required'],
    },
    requiredWheelType: {
      type: String,
      enum: ['6', '10', '12', '14', '14+'],
      required: [true, 'Required wheel count is required'],
    },
    requiredPermitType: {
      type: String,
      enum: ['local', 'state', 'national_permit', 'all_india_permit'],
      default: 'all_india_permit',
    },
    amountType: {
      type: String,
      enum: ['pre_cash', 'post_cash', 'to_pay', 'advance_plus_balance'],
      default: 'advance_plus_balance',
    },
    priceRate: {
      type: Number,
      required: [true, 'Budget/Rate in INR is required'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed'],
      default: 'open',
    },
    driverAssignmentBadge: {
      type: String,
      enum: ['not_approved', 'live'],
      default: 'not_approved',
    },
    willingTransporters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    assignedTransporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    willingDrivers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup
loadSchema.index({ status: 1, loadOwner: 1 });
loadSchema.index({ assignedTransporter: 1, status: 1 });
loadSchema.index({ assignedDriver: 1, status: 1 });

module.exports = mongoose.model('Load', loadSchema);
