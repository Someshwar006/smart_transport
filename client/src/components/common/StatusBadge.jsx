import React from 'react';
import { Clock, ShieldCheck, CheckCircle2, AlertCircle, Truck } from 'lucide-react';

const StatusBadge = ({ status, driverBadge, className = '' }) => {
  // If driver assignment badge is specified specifically:
  if (driverBadge) {
    if (driverBadge === 'live') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#2563EB] border border-blue-200 shadow-sm ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse"></span>
          Live / On Road
        </span>
      );
    }
    if (driverBadge === 'not_approved') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F3E8FF] text-[#7C3AED] border border-purple-200 shadow-sm ${className}`}
        >
          <Clock className="w-3.5 h-3.5" />
          Driver Pending
        </span>
      );
    }
  }

  // Base Load status styling:
  switch (status) {
    case 'open':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#D97706] border border-amber-200 shadow-sm ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
          Open for Bids
        </span>
      );
    case 'in_progress':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#2563EB] border border-blue-200 shadow-sm ${className}`}
        >
          <Truck className="w-3.5 h-3.5" />
          In Progress
        </span>
      );
    case 'completed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#D1FAE5] text-[#059669] border border-emerald-200 shadow-sm ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed / Received
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 ${className}`}
        >
          {status}
        </span>
      );
  }
};

export default StatusBadge;
