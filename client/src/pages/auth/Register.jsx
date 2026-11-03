import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Truck,
  Mail,
  Lock,
  User,
  Phone,
  Building,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Layers,
  Award,
} from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState('load_owner');
  const [loading, setLoading] = useState(false);

  // Common fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    privacySetting: 'secure', // 'public' | 'secure'

    // Load Owner & Transporter
    companyName: '',
    headLocation: '',
    description: '',

    // Transporter specific
    ceoName: '',
    secondaryPhone: '',

    // Driver specific
    vehicleNumber: '',
    vehicleType: 'box_container',
    wheelType: '10',
    permitType: 'all_india_permit',
    licenseNumber: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTogglePrivacy = (setting) => {
    setFormData((prev) => ({ ...prev, privacySetting: setting }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      showError('Please fill in all core credentials (Name, Email, Password, Phone)');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        role: activeRole,
      };

      const user = await register(payload);
      showSuccess(`Account registered successfully as ${user.name}!`);

      // Always navigate to the overall home page
      navigate('/');
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-600/20">
            <Truck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Join the LogiConnect Freight Network
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Choose your platform role to configure your verified operational specifications
          </p>
        </div>

        {/* Top Gate: 3 Role Switcher */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveRole('load_owner')}
            className={`py-3 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeRole === 'load_owner'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Load Owner
          </button>
          <button
            type="button"
            onClick={() => setActiveRole('transporter')}
            className={`py-3 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeRole === 'transporter'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Transporter
          </button>
          <button
            type="button"
            onClick={() => setActiveRole('driver')}
            className={`py-3 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeRole === 'driver'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lorry Driver
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Universal Core Credentials */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" />
              Primary Account Credentials
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name / Contact Person *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Rajesh Kumar"
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="rajesh@logiconnect.in"
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password (6+ chars) *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
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
                  placeholder="e.g. +91 98765 43210"
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Role-Specific Fields */}
          {activeRole === 'load_owner' && (
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-indigo-600" />
                Industrial Plant & Enterprise Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Factory Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Tata Steel Plant"
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Head Plant / Warehouse City *
                  </label>
                  <input
                    type="text"
                    name="headLocation"
                    value={formData.headLocation}
                    onChange={handleChange}
                    placeholder="e.g. Jamshedpur, Jharkhand"
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operations Overview / Freight Profile
                </label>
                <textarea
                  name="description"
                  rows="2"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="e.g. Regular outbound steel and industrial hardware shipments across South and West corridors."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                ></textarea>
              </div>
            </div>
          )}

          {activeRole === 'transporter' && (
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600" />
                Transport Agency & Fleet Profile
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Transport Agency Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. VRL Logistics Ltd."
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CEO / Managing Director Name
                  </label>
                  <input
                    type="text"
                    name="ceoName"
                    value={formData.ceoName}
                    onChange={handleChange}
                    placeholder="e.g. Vijay Sankeshwar"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Main Hub / Operating City *
                  </label>
                  <input
                    type="text"
                    name="headLocation"
                    value={formData.headLocation}
                    onChange={handleChange}
                    placeholder="e.g. Hubli / Bengaluru, Karnataka"
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Secondary / Dispatch Desk Phone
                  </label>
                  <input
                    type="text"
                    name="secondaryPhone"
                    value={formData.secondaryPhone}
                    onChange={handleChange}
                    placeholder="e.g. +91 80 2345 6789"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fleet Overview & Route Coverage
                </label>
                <textarea
                  name="description"
                  rows="2"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="e.g. 150+ fleet containers operating across Golden Quadrilateral with GPS tracking."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                ></textarea>
              </div>
            </div>
          )}

          {activeRole === 'driver' && (
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-purple-600" />
                Lorry Vehicle & Permit Specifications
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vehicle Number (Registration) *
                  </label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    placeholder="e.g. TN-57-AB-1234"
                    required
                    className="w-full px-3 py-2 text-sm font-mono uppercase rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Driving License Number *
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="e.g. DL-0420110012345"
                    required
                    className="w-full px-3 py-2 text-sm font-mono uppercase rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vehicle Body Type *
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
                    Wheel Configuration *
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
                    Permit Class *
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
            </div>
          )}

          {/* Public vs Secure Contact Privacy Toggle */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
              Contact Visibility & Privacy Control
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => handleTogglePrivacy('secure')}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                  formData.privacySetting === 'secure'
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck
                  className={`w-5 h-5 mt-0.5 ${
                    formData.privacySetting === 'secure' ? 'text-blue-600' : 'text-slate-400'
                  }`}
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Secure Mode (Recommended)
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Phone number masked (+91 ••••• ••345) until mutual connection request is accepted.
                  </div>
                </div>
              </div>

              <div
                onClick={() => handleTogglePrivacy('public')}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                  formData.privacySetting === 'public'
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Phone
                  className={`w-5 h-5 mt-0.5 ${
                    formData.privacySetting === 'public' ? 'text-blue-600' : 'text-slate-400'
                  }`}
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Public Directory
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Phone visible to all registered network members for immediate calls.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 transition transform active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Creating Verified Account...' : `Register as ${activeRole.replace('_', ' ').toUpperCase()}`}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 text-xs text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:underline">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

