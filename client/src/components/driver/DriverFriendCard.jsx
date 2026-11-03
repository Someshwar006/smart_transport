import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useNotification } from '../../context/NotificationContext';
import { Truck, Phone, ShieldCheck, UserPlus, Clock, Check, Lock } from 'lucide-react';

const DriverFriendCard = ({ driver, onConnect, onConnectionUpdated }) => {
  const { showSuccess, showError } = useNotification();
  const [acting, setActing] = useState(false);

  const connStatus = driver.connectionInfo?.status || 'none';
  const connId = driver.connectionInfo?.connectionId;

  const handleConnect = async () => {
    try {
      setActing(true);
      await onConnect(driver._id);
    } finally {
      setActing(false);
    }
  };

  const handleAccept = async () => {
    try {
      setActing(true);
      const res = await axiosClient.patch(`/connections/${connId}/respond`, { status: 'accepted' });
      if (res.data?.success) {
        showSuccess('Connection accepted! Direct contact revealed.');
        if (onConnectionUpdated) onConnectionUpdated();
      }
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to accept connection');
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 font-bold text-base">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 leading-snug">{driver.name}</h4>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Certified Driver
              </span>
            </div>

            {driver.vehicleNumber && (
              <div className="mt-1 inline-block font-mono text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded shadow-sm">
                {driver.vehicleNumber}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Specs Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
        <div>
          <span className="text-[10px] text-slate-400 block font-semibold uppercase">Body Style</span>
          <span className="font-bold text-slate-800 capitalize">
            {driver.vehicleType?.replace('_', ' ') || 'Multi-Utility'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block font-semibold uppercase">Axle / Wheels</span>
          <span className="font-bold text-slate-800">{driver.wheelType || '10'} Wheeler</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block font-semibold uppercase">Permit Class</span>
          <span className="font-bold text-slate-800 uppercase">
            {driver.permitType?.replace(/_/g, ' ') || 'National'}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block font-semibold uppercase">License</span>
          <span className="font-mono font-bold text-slate-800 uppercase">
            {driver.licenseNumber || 'Verified HMV'}
          </span>
        </div>
      </div>

      {driver.description && (
        <p className="text-xs text-slate-600 italic line-clamp-2">"{driver.description}"</p>
      )}

      {/* Contact & Connection Status */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span className={driver.isPhoneMasked ? 'text-slate-400 font-semibold' : 'text-slate-800 font-bold'}>
            {driver.phone}
          </span>
          {driver.isPhoneMasked && (
            <span title="Connect to unmask direct number" className="cursor-help">
              <Lock className="w-3 h-3 text-amber-500" />
            </span>
          )}
        </div>

        {/* Dynamic Connect Action Button */}
        <div>
          {connStatus === 'accepted' ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <Check className="w-3.5 h-3.5" /> Connected
            </span>
          ) : connStatus === 'pending_sent' ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              <Clock className="w-3.5 h-3.5" /> Pending Approval
            </span>
          ) : connStatus === 'pending_received' ? (
            <button
              onClick={handleAccept}
              disabled={acting}
              className="inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{acting ? 'Accepting...' : 'Accept Request'}</span>
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={acting}
              className="inline-flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{acting ? 'Connecting...' : 'Connect'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverFriendCard;
