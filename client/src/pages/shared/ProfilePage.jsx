import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import axiosClient from '../../api/axiosClient';
import Modal from '../../components/common/Modal';
import {
  User,
  ShieldCheck,
  ShieldAlert,
  Phone,
  Building,
  MapPin,
  Truck,
  Users,
  Trash2,
  Save,
  CheckCircle,
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    privacySetting: user?.privacySetting || 'secure',
    companyName: user?.companyName || '',
    headLocation: user?.headLocation || '',
    description: user?.description || '',
    ceoName: user?.ceoName || '',
    secondaryPhone: user?.secondaryPhone || '',
    vehicleNumber: user?.vehicleNumber || '',
    vehicleType: user?.vehicleType || 'box_container',
    wheelType: user?.wheelType || '10',
    permitType: user?.permitType || 'all_india_permit',
    licenseNumber: user?.licenseNumber || '',
  });

  const [saving, setSaving] = useState(false);
  const [totalConnectedPeers, setTotalConnectedPeers] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosClient.get('/connections/my');
        if (res.data?.success) {
          setTotalConnectedPeers(res.data.totalConnected || 0);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTogglePrivacy = (setting) => {
    setFormData((prev) => ({ ...prev, privacySetting: setting }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await axiosClient.put('/users/profile', formData);
      if (res.data?.success) {
        showSuccess('Profile updated successfully!');
        updateUser(res.data.user);
      }
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      const res = await axiosClient.delete('/users/profile');
      if (res.data?.success) {
        showSuccess('Account has been deleted.');
        logout();
      }
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Banner / Stats */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-extrabold text-2xl flex items-center justify-center uppercase shadow-md">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{user?.name}</h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
          </div>
        </div>

        {/* Dynamic peer counter */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-center sm:text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Connected Network Peers
          </span>
          <div className="text-2xl font-extrabold text-slate-900 flex items-center justify-center sm:justify-end gap-1.5 mt-0.5">
            <Users className="w-5 h-5 text-blue-600" />
            <span>{totalConnectedPeers}</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Verified Mutual Connections</span>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900">Operational Profile & Specifications</h2>
          <span className="text-xs text-slate-400">Keep your details up to date for dispatchers</span>
        </div>

        {/* Core fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact Person / Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Phone Number *
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Role specific inputs */}
        {(user?.role === 'load_owner' || user?.role === 'transporter') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {user?.role === 'load_owner' ? 'Factory / Company Name' : 'Transport Agency Name'}
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Head Plant / Hub City
              </label>
              <input
                type="text"
                name="headLocation"
                value={formData.headLocation}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {user?.role === 'transporter' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CEO / Managing Director
                  </label>
                  <input
                    type="text"
                    name="ceoName"
                    value={formData.ceoName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Secondary Dispatch Phone
                  </label>
                  <input
                    type="text"
                    name="secondaryPhone"
                    value={formData.secondaryPhone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company / Agency Overview
              </label>
              <textarea
                name="description"
                rows="2"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              ></textarea>
            </div>
          </div>
        )}

        {/* Driver specific */}
        {user?.role === 'driver' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vehicle Registration Number
              </label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm font-mono uppercase rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Driving License Number
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm font-mono uppercase rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vehicle Body Style
              </label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="box_container">Closed Box Container</option>
                <option value="tarpaulin">Covered Tarpaulin Body</option>
                <option value="flatbed">Flatbed Trailer</option>
                <option value="open_tipper">Open Tipper Body</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Wheel Configuration
              </label>
              <select
                name="wheelType"
                value={formData.wheelType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="6">6 Wheeler</option>
                <option value="10">10 Wheeler</option>
                <option value="12">12 Wheeler</option>
                <option value="14">14 Wheeler</option>
                <option value="14+">14+ Wheeler Heavy Multi-Axle</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Permit Class
              </label>
              <select
                name="permitType"
                value={formData.permitType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="all_india_permit">All India Permit (AIP)</option>
                <option value="national_permit">National Highway Corridor Permit</option>
                <option value="state">Intra-State Permit</option>
                <option value="local">Local Urban Permit</option>
              </select>
            </div>
          </div>
        )}

        {/* Privacy Toggle Section */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
            Privacy & Contact Masking Settings
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => handleTogglePrivacy('secure')}
              className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                formData.privacySetting === 'secure'
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <ShieldCheck
                className={`w-5 h-5 mt-0.5 ${
                  formData.privacySetting === 'secure' ? 'text-blue-600' : 'text-slate-400'
                }`}
              />
              <div>
                <div className="text-xs font-bold text-slate-900">Secure Privacy Mode</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Mask phone number (+91 ••••• ••345) to public directory. Visible only to accepted partners.
                </div>
              </div>
            </div>

            <div
              onClick={() => handleTogglePrivacy('public')}
              className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                formData.privacySetting === 'public'
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <Phone
                className={`w-5 h-5 mt-0.5 ${
                  formData.privacySetting === 'public' ? 'text-blue-600' : 'text-slate-400'
                }`}
              />
              <div>
                <div className="text-xs font-bold text-slate-900">Public Contact Mode</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Full phone number visible to all registered network members for rapid communication.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Account Confirmation"
        subtitle="This action is permanent and cannot be undone."
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
            Deleting your account will remove your profile, active listings, and all connection ties from the LogiConnect freight network.
          </div>

          <p className="text-xs text-slate-600">
            Are you completely sure you want to proceed with account removal?
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
