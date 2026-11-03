import React, { useState } from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import {
  MapPin,
  ArrowRight,
  Truck,
  IndianRupee,
  Building,
  CheckCircle,
  ThumbsUp,
  Info,
  Calendar,
} from 'lucide-react';

const LoadCardDriver = ({ load, currentUserId, onAcceptWilling, isAssignedToMe = false }) => {
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [submittingWilling, setSubmittingWilling] = useState(false);

  const isAlreadyWilling = load.willingDrivers?.some(
    (id) => (typeof id === 'object' ? id._id : id) === currentUserId
  );

  const handleWilling = async () => {
    setSubmittingWilling(true);
    await onAcceptWilling(load._id);
    setSubmittingWilling(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm card-hover animate-fadeIn overflow-hidden flex flex-col">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
        <div>
          <h3 className="text-base font-bold text-slate-900 leading-snug">{load.loadName}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Contracted Transporter: <strong className="text-slate-800">{load.assignedTransporter?.companyName || load.assignedTransporter?.name}</strong>
          </p>
        </div>

        <div>
          {isAssignedToMe ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Assigned to You (LIVE)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Driver Needed
            </span>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-5 space-y-4 flex-1">
        {/* Route visualization */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Pickup Station</div>
            <div className="text-sm font-bold text-slate-900">{load.fromLocation?.city}</div>
            <div className="text-xs text-slate-500">{load.fromLocation?.state}</div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="flex-1 text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Drop Destination</div>
            <div className="text-sm font-bold text-slate-900">{load.toLocation?.city}</div>
            <div className="text-xs text-slate-500">{load.toLocation?.state}</div>
          </div>
        </div>

        {/* Specs Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Weight</span>
            <span className="font-bold text-slate-800">{load.weight} Tons</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Vehicle Body</span>
            <span className="font-bold text-slate-800 capitalize">{load.requiredVehicleType?.replace('_', ' ')}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Wheels</span>
            <span className="font-bold text-slate-800">{load.requiredWheelType} Wheeler</span>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
            <span className="text-[10px] text-emerald-700 block font-semibold uppercase">Freight Value</span>
            <span className="font-extrabold text-emerald-800">₹{load.priceRate?.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {load.description && (
          <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 italic">
            "{load.description}"
          </p>
        )}
      </div>

      {/* Touch-Friendly Action Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
        <button
          onClick={() => setDetailsModalOpen(true)}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition"
        >
          <Info className="w-3.5 h-3.5 text-slate-400" />
          Full Route Info
        </button>

        {!isAssignedToMe && (
          <div>
            {isAlreadyWilling ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 px-3.5 py-2 rounded-xl border border-purple-200">
                <CheckCircle className="w-4 h-4 text-purple-600" />
                <span>Marked Willing (Awaiting Dispatch)</span>
              </div>
            ) : (
              <button
                onClick={handleWilling}
                disabled={submittingWilling}
                className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition active:scale-95 disabled:opacity-50"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{submittingWilling ? 'Submitting...' : 'Accept / Willing to Carry'}</span>
              </button>
            )}
          </div>
        )}

        {isAssignedToMe && (
          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> Trip in Progress
          </span>
        )}
      </div>

      {/* Full Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={load.loadName}
        subtitle="Complete Freight Route & Consignment Specifications"
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <span className="font-bold text-emerald-800 block mb-1 uppercase text-xs">Pickup Details</span>
              <p className="font-semibold text-slate-800">{load.fromLocation?.city}, {load.fromLocation?.state}</p>
              <p className="text-slate-600 mt-1">{load.fromLocation?.address || 'Industrial loading zone'}</p>
              <p className="text-slate-500 mt-0.5">Pincode: {load.fromLocation?.pincode || 'N/A'}</p>
            </div>

            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <span className="font-bold text-blue-800 block mb-1 uppercase text-xs">Delivery Destination</span>
              <p className="font-semibold text-slate-800">{load.toLocation?.city}, {load.toLocation?.state}</p>
              <p className="text-slate-600 mt-1">{load.toLocation?.address || 'Consignee warehouse'}</p>
              <p className="text-slate-500 mt-0.5">Pincode: {load.toLocation?.pincode || 'N/A'}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block text-xs uppercase">Vehicle Requirements</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div>Body: <strong className="capitalize">{load.requiredVehicleType?.replace('_', ' ')}</strong></div>
              <div>Wheels: <strong>{load.requiredWheelType} Wheeler</strong></div>
              <div>Permit: <strong className="uppercase">{load.requiredPermitType?.replace('_', ' ')}</strong></div>
              <div>Packing: <strong className="capitalize">{load.loadPackType}</strong></div>
              <div>Payment: <strong className="capitalize">{load.amountType?.replace(/_/g, ' ')}</strong></div>
              <div>Budget: <strong className="text-emerald-700">₹{load.priceRate?.toLocaleString('en-IN')}</strong></div>
            </div>
          </div>

          <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-1">
            <span className="font-bold text-purple-900 block text-xs uppercase">Transporter Agency</span>
            <p className="text-slate-800 font-semibold">{load.assignedTransporter?.companyName || load.assignedTransporter?.name}</p>
            <p className="text-slate-600">Hub: {load.assignedTransporter?.headLocation || 'India'}</p>
            <p className="text-slate-600">Phone: {load.assignedTransporter?.phone}</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LoadCardDriver;
