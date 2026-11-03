import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useNotification } from '../../context/NotificationContext';
import LoadCardOwner from '../../components/loadOwner/LoadCardOwner';
import PostLoadModal from '../../components/loadOwner/PostLoadModal';
import {
  Package,
  PlusCircle,
  Clock,
  Layers,
  CheckCircle2,
  Filter,
  Search,
  Truck,
  RotateCw,
} from 'lucide-react';

const MyLoadsOwner = () => {
  const { showSuccess, showError } = useNotification();
  const [activeTab, setActiveTab] = useState('open'); // 'open' | 'in_progress' | 'completed'
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [transporterFilter, setTransporterFilter] = useState('');

  const fetchLoads = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/loads/my?status=${activeTab}`);
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
  }, [activeTab]);

  // Handler for assigning transporter
  const handleAssignTransporter = async (loadId, transporterId) => {
    try {
      const res = await axiosClient.patch(`/loads/${loadId}/assign-transporter`, { transporterId });
      if (res.data?.success) {
        showSuccess('Transporter assigned! Load moved to Progressing Loads.');
        // Instant state update: move load from "Open" tab to "Progressing" tab
        setActiveTab('in_progress');
      }
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to assign transporter');
    }
  };

  // Handler for revoking assignment
  const handleRevokeAssignment = async (loadId) => {
    try {
      const res = await axiosClient.patch(`/loads/${loadId}/revoke-transporter`);
      if (res.data?.success) {
        showSuccess('Assignment deleted. Load moved back to Open Loads.');
        fetchLoads();
      }
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to revoke assignment');
    }
  };

  // Handler for completing load
  const handleCompleteLoad = async (loadId) => {
    try {
      const res = await axiosClient.patch(`/loads/${loadId}/complete`);
      if (res.data?.success) {
        showSuccess('Delivery acknowledged and marked as Completed!');
        fetchLoads();
      }
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to complete load');
    }
  };

  // Filter loads by transporter name if typed
  const filteredLoads = loads.filter((load) => {
    if (!transporterFilter.trim()) return true;
    const tName = load.assignedTransporter?.companyName || load.assignedTransporter?.name || '';
    return tName.toLowerCase().includes(transporterFilter.toLowerCase().trim());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Freight Dispatch Central
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Load Owner Portal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your industrial consignments, assign bidding fleet transporters, and track live trips
          </p>
        </div>

        <button
          onClick={() => setPostModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Freight Load</span>
        </button>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Primary 3 Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl max-w-md w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('open')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'open'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Open Loads</span>
          </button>

          <button
            onClick={() => setActiveTab('in_progress')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'in_progress'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Progressing Loads</span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'completed'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed Loads</span>
          </button>
        </div>

        {/* Side Filter: Transporter filter & Refresh */}
        <div className="flex items-center gap-3">
          {activeTab === 'in_progress' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={transporterFilter}
                onChange={(e) => setTransporterFilter(e.target.value)}
                placeholder="Filter by Transporter Name..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-blue-500 outline-none bg-white"
              />
            </div>
          )}

          <button
            onClick={fetchLoads}
            disabled={loading}
            title="Refresh feed"
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shrink-0"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid Feed */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Fetching consignment records...</p>
        </div>
      ) : filteredLoads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No {activeTab.replace('_', ' ')} loads found
          </h3>
          <p className="text-xs text-slate-500">
            {activeTab === 'open'
              ? 'You do not have any open loads awaiting bids. Click "Post New Freight Load" to create one.'
              : activeTab === 'in_progress'
              ? 'No active contracts currently moving on the highway.'
              : 'Your completed deliveries log will appear here.'}
          </p>
          {activeTab === 'open' && (
            <button
              onClick={() => setPostModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Post a Load
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLoads.map((load) => (
            <LoadCardOwner
              key={load._id}
              load={load}
              onAssignTransporter={handleAssignTransporter}
              onRevokeAssignment={handleRevokeAssignment}
              onCompleteLoad={handleCompleteLoad}
            />
          ))}
        </div>
      )}

      {/* Post Load Modal */}
      <PostLoadModal
        isOpen={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        onPostSuccess={() => {
          setActiveTab('open');
          fetchLoads();
        }}
      />
    </div>
  );
};

export default MyLoadsOwner;
