import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import LoadCardDriver from '../../components/driver/LoadCardDriver';
import {
  Compass,
  Truck,
  RotateCw,
  Layers,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const AvailableLoadsDriver = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'my_live' | 'completed'
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLoads = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      if (activeTab === 'available') {
        endpoint = '/loads/driver/available';
      } else if (activeTab === 'my_live') {
        endpoint = '/loads/driver/my?status=in_progress';
      } else {
        endpoint = '/loads/driver/my?status=completed';
      }

      const res = await axiosClient.get(endpoint);
      if (res.data?.success) {
        setLoads(res.data.loads);
      }
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to fetch driver loads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoads();
  }, [activeTab]);

  const handleAcceptWilling = async (loadId) => {
    try {
      const res = await axiosClient.patch(`/loads/${loadId}/driver-accept`);
      if (res.data?.success) {
        showSuccess('Marked as Willing! The contracted Transporter has been notified to confirm dispatch.');
        fetchLoads();
      }
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to mark willingness');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Highway Freight & Trips
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Lorry Driver Cockpit
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse consignments contracted to your connected transporters. Tap "Accept / Willing" to secure your trip.
          </p>
        </div>

        <button
          onClick={fetchLoads}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition self-start sm:self-auto"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Feeds</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center p-1.5 bg-slate-100 rounded-2xl max-w-lg">
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeTab === 'available'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Available Loads</span>
        </button>

        <button
          onClick={() => setActiveTab('my_live')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeTab === 'my_live'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>My Live Trips</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeTab === 'completed'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Trip History</span>
        </button>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Looking up highway loads...</p>
        </div>
      ) : loads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto shadow-sm">
          <Truck className="w-10 h-10 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {activeTab === 'available'
                ? 'No Active Dispatches Available'
                : activeTab === 'my_live'
                ? 'No Live Trips Active Right Now'
                : 'No Completed Trips Yet'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {activeTab === 'available'
                ? 'No active dispatches available from your connected transports. Connect with more Transporters to receive daily hauling routes.'
                : activeTab === 'my_live'
                ? 'When a Transporter assigns you to a load, it will turn Live here.'
                : 'Your successfully delivered highway loads will be cataloged here.'}
            </p>
          </div>
          {activeTab === 'available' && (
            <div>
              <Link
                to="/driver/transporters"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm active:scale-95"
              >
                <span>Explore Transporters</span>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loads.map((load) => (
            <LoadCardDriver
              key={load._id}
              load={load}
              currentUserId={user?._id}
              onAcceptWilling={handleAcceptWilling}
              isAssignedToMe={activeTab === 'my_live' || activeTab === 'completed'}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableLoadsDriver;

