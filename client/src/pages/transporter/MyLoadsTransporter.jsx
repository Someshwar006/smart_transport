import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import LoadCardTransporter from '../../components/transporter/LoadCardTransporter';
import {
  Compass,
  Layers,
  CheckCircle2,
  Truck,
  RotateCw,
  Search,
  Building,
} from 'lucide-react';

const MyLoadsTransporter = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  // 3 Sub-segments: 'available' | 'progressing' | 'completed'
  const [activeSegment, setActiveSegment] = useState('available');
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLoads = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      if (activeSegment === 'available') {
        endpoint = '/loads/transporter/available';
      } else if (activeSegment === 'progressing') {
        endpoint = '/loads/transporter/my?status=in_progress';
      } else {
        endpoint = '/loads/transporter/my?status=completed';
      }

      const res = await axiosClient.get(endpoint);
      if (res.data?.success) {
        setLoads(res.data.loads);
      }
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to fetch loads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoads();
  }, [activeSegment]);

  const handleAcceptLoad = async (loadId) => {
    try {
      const res = await axiosClient.patch(`/loads/${loadId}/transporter-accept`);
      if (res.data?.success) {
        showSuccess('Interest registered! The Load Owner has received an email alert.');
        fetchLoads();
      }
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to accept load');
    }
  };

  const handleDriverAssigned = (updatedLoad) => {
    showSuccess('Driver assigned! Shipment status updated to LIVE.');
    fetchLoads();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Fleet Operations & Consignments
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Transporter Desk
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review available cargo from your connected industrial shippers, dispatch verified drivers, and fulfill freight orders
          </p>
        </div>

        <button
          onClick={fetchLoads}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition self-start sm:self-auto"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Loads</span>
        </button>
      </div>

      {/* Segment Switcher (3 Sub-segments) */}
      <div className="flex items-center p-1.5 bg-slate-100 rounded-2xl max-w-xl">
        <button
          onClick={() => setActiveSegment('available')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeSegment === 'available'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Segment 1: Available</span>
        </button>

        <button
          onClick={() => setActiveSegment('progressing')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeSegment === 'progressing'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Segment 2: Progressing</span>
        </button>

        <button
          onClick={() => setActiveSegment('completed')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeSegment === 'completed'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Segment 3: Completed</span>
        </button>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Fetching loads feed...</p>
        </div>
      ) : loads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto shadow-sm">
          <Truck className="w-10 h-10 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {activeSegment === 'available'
                ? 'No Available Freight Right Now'
                : activeSegment === 'progressing'
                ? 'No Active Contracts in Progress'
                : 'No Completed Loads Recorded'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {activeSegment === 'available'
                ? 'No available freight right now. Check your Connected Load Owners or explore new Load Owners to build partnerships.'
                : activeSegment === 'progressing'
                ? 'When a Load Owner awards you a contract, it will appear here for driver assignment.'
                : 'Delivered shipments will be safely archived in this log.'}
            </p>
          </div>
          {activeSegment === 'available' && (
            <div>
              <Link
                to="/transporter/owners"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm active:scale-95"
              >
                <span>Explore Load Owners</span>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loads.map((load) => (
            <LoadCardTransporter
              key={load._id}
              load={load}
              segment={activeSegment}
              currentUserId={user?._id}
              onAcceptLoad={handleAcceptLoad}
              onDriverAssigned={handleDriverAssigned}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLoadsTransporter;
