import React, { useState } from 'react';
import Modal from '../common/Modal';
import axiosClient from '../../api/axiosClient';
import { useNotification } from '../../context/NotificationContext';
import { Package, MapPin, Truck, IndianRupee, Layers, FileText } from 'lucide-react';

const PostLoadModal = ({ isOpen, onClose, onPostSuccess }) => {
  const { showSuccess, showError } = useNotification();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    loadName: '',
    category: 'Industrial',
    weight: '',
    loadPackType: 'closed',
    fromAddress: '',
    fromCity: '',
    fromState: '',
    fromPincode: '',
    toAddress: '',
    toCity: '',
    toState: '',
    toPincode: '',
    requiredVehicleType: 'box_container',
    requiredWheelType: '10',
    requiredPermitType: 'national_permit',
    amountType: 'advance_plus_balance',
    priceRate: '',
    imageUrl: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.loadName || !formData.weight || !formData.fromCity || !formData.toCity || !formData.priceRate) {
      showError('Please fill in all required fields (Name, Weight, Pickup, Drop, Rate)');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        loadName: formData.loadName,
        category: formData.category,
        weight: Number(formData.weight),
        loadPackType: formData.loadPackType,
        fromLocation: {
          address: formData.fromAddress,
          city: formData.fromCity,
          state: formData.fromState,
          pincode: formData.fromPincode,
        },
        toLocation: {
          address: formData.toAddress,
          city: formData.toCity,
          state: formData.toState,
          pincode: formData.toPincode,
        },
        requiredVehicleType: formData.requiredVehicleType,
        requiredWheelType: formData.requiredWheelType,
        requiredPermitType: formData.requiredPermitType,
        amountType: formData.amountType,
        priceRate: Number(formData.priceRate),
        imageUrl: formData.imageUrl,
        description: formData.description,
      };

      const res = await axiosClient.post('/loads', payload);
      if (res.data?.success) {
        showSuccess('Freight load posted successfully! Connected transporters can now review and accept.');
        onPostSuccess(res.data.load);
        onClose();
        // Reset form
        setFormData({
          loadName: '',
          category: 'Industrial',
          weight: '',
          loadPackType: 'closed',
          fromAddress: '',
          fromCity: '',
          fromState: '',
          fromPincode: '',
          toAddress: '',
          toCity: '',
          toState: '',
          toPincode: '',
          requiredVehicleType: 'box_container',
          requiredWheelType: '10',
          requiredPermitType: 'national_permit',
          amountType: 'advance_plus_balance',
          priceRate: '',
          imageUrl: '',
          description: '',
        });
      }
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to post freight load');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Post New Freight Load"
      subtitle="Broadcast to your network of connected certified transporters"
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Load Details */}
        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Package className="w-4 h-4 text-blue-600" />
            <span>Cargo & Shipment Specification</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Load Name / Cargo Title *
              </label>
              <input
                type="text"
                name="loadName"
                value={formData.loadName}
                onChange={handleChange}
                placeholder="e.g. Mild Steel Billets 25MT"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Industrial">Industrial</option>
                <option value="Agricultural">Agricultural</option>
                <option value="FMCG">FMCG</option>
                <option value="Raw Material">Raw Material</option>
                <option value="Automotive">Automotive</option>
                <option value="Chemicals">Chemicals</option>
                <option value="Textile">Textile</option>
                <option value="Electronics">Electronics</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Weight (in Metric Tons) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g. 18.5"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Packing Type
              </label>
              <select
                name="loadPackType"
                value={formData.loadPackType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="closed">Closed / Containerized</option>
                <option value="open">Open / Loose Bundles</option>
                <option value="palletized">Palletized</option>
                <option value="loose">Loose Bulk</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Origin & Destination Routes */}
        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Freight Route (Origin & Destination)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pickup */}
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                Pickup Location
              </span>
              <input
                type="text"
                name="fromCity"
                value={formData.fromCity}
                onChange={handleChange}
                placeholder="Pickup City (e.g. Chennai) *"
                required
                className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
              <input
                type="text"
                name="fromState"
                value={formData.fromState}
                onChange={handleChange}
                placeholder="State (e.g. Tamil Nadu) *"
                required
                className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
              <input
                type="text"
                name="fromAddress"
                value={formData.fromAddress}
                onChange={handleChange}
                placeholder="Pickup Facility / Industrial Area"
                className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
              <input
                type="text"
                name="fromPincode"
                value={formData.fromPincode}
                onChange={handleChange}
                placeholder="Pincode (e.g. 600001)"
                className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Delivery */}
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                Delivery Destination
              </span>
              <input
                type="text"
                name="toCity"
                value={formData.toCity}
                onChange={handleChange}
                placeholder="Delivery City (e.g. Bengaluru) *"
                required
                className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                name="toState"
                value={formData.toState}
                onChange={handleChange}
                placeholder="State (e.g. Karnataka) *"
                required
                className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                name="toAddress"
                value={formData.toAddress}
                onChange={handleChange}
                placeholder="Warehouse / Plant Delivery Address"
                className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                name="toPincode"
                value={formData.toPincode}
                onChange={handleChange}
                placeholder="Pincode (e.g. 560001)"
                className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Vehicle & Wheel Requirements */}
        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Truck className="w-4 h-4 text-purple-600" />
            <span>Vehicle Body, Wheels & Permit Standards</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Body Type *
              </label>
              <select
                name="requiredVehicleType"
                value={formData.requiredVehicleType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="box_container">Closed Container</option>
                <option value="tarpaulin">Tarpaulin / Covered</option>
                <option value="flatbed">Flatbed Platform</option>
                <option value="open_tipper">Open Tipper Body</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Wheel Configuration *
              </label>
              <select
                name="requiredWheelType"
                value={formData.requiredWheelType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="6">6 Wheeler (Light/Medium)</option>
                <option value="10">10 Wheeler (Heavy Haul)</option>
                <option value="12">12 Wheeler (Multi-Axle)</option>
                <option value="14">14 Wheeler (Long Trailer)</option>
                <option value="14+">14+ Wheeler (Heavy ODC)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Permit Mandatory
              </label>
              <select
                name="requiredPermitType"
                value={formData.requiredPermitType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="all_india_permit">All India Permit (AIP)</option>
                <option value="national_permit">National Highway Permit</option>
                <option value="state">State Permit</option>
                <option value="local">Local Urban Permit</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Budget & Rate Terms */}
        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            <span>Commercial Terms & Freight Budget</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Budgeted Freight Rate (INR) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  name="priceRate"
                  value={formData.priceRate}
                  onChange={handleChange}
                  placeholder="e.g. 52000"
                  required
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Arrangement
              </label>
              <select
                name="amountType"
                value={formData.amountType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="advance_plus_balance">Advance + Balance upon Delivery</option>
                <option value="to_pay">To-Pay (Consignee Cash/NEFT)</option>
                <option value="pre_cash">100% Pre-Paid Cash</option>
                <option value="post_cash">Post-Delivery Immediate Settlement</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Handling Instructions / Description
            </label>
            <textarea
              name="description"
              rows="2"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Urgent plant transfer. Requires clean floor, tarpaulin tied with ropes, driver must carry safety helmet."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            ></textarea>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition disabled:opacity-50"
          >
            {submitting ? 'Publishing...' : 'Publish Load to Network'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PostLoadModal;
