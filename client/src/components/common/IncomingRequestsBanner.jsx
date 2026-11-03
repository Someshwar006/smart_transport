import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useNotification } from '../../context/NotificationContext';
import { UserCheck, Check, X, ShieldCheck, MapPin, Building, Truck, Clock } from 'lucide-react';

const IncomingRequestsBanner = ({ onConnectionUpdated }) => {
  const { showSuccess, showError } = useNotification();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [respondingId, setRespondingId] = useState(null);

  const fetchIncoming = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/connections/requests/incoming');
      if (res.data?.success) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error('Failed to fetch incoming requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncoming();
  }, []);

  const handleRespond = async (connectionId, status) => {
    try {
      setRespondingId(connectionId);
      const res = await axiosClient.patch(`/connections/${connectionId}/respond`, { status });
      if (res.data?.success) {
        showSuccess(`Connection request ${status === 'accepted' ? 'accepted' : 'rejected'}`);
        // Remove from local list
        setRequests((prev) => prev.filter((r) => r._id !== connectionId));
        if (onConnectionUpdated) {
          onConnectionUpdated();
        }
      }
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to respond to request');
    } finally {
      setRespondingId(null);
    }
  };

  if (requests.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50 border border-blue-200 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-snug">
              Incoming Partnership & Connection Requests
            </h3>
            <p className="text-xs text-slate-500">
              You have <strong className="text-blue-700">{requests.length}</strong> pending request(s) awaiting your response
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Action Required
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {requests.map((reqItem) => {
          const reqUser = reqItem.requester;
          if (!reqUser) return null;
          const isResponding = respondingId === reqItem._id;

          return (
            <div
              key={reqItem._id}
              className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center uppercase shrink-0">
                    {reqUser.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{reqUser.name}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 uppercase">
                        {reqUser.role?.replace('_', ' ')}
                      </span>
                    </div>
                    {reqUser.companyName && (
                      <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                        {reqUser.companyName}
                      </p>
                    )}
                    {reqUser.headLocation && (
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {reqUser.headLocation}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleRespond(reqItem._id, 'rejected')}
                  disabled={isResponding}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleRespond(reqItem._id, 'accepted')}
                  disabled={isResponding}
                  className="flex items-center gap-1 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isResponding ? 'Updating...' : 'Accept Request'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IncomingRequestsBanner;

