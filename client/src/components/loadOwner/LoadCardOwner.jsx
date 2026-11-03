import React, { useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import TransporterBidCard from './TransporterBidCard';
import {
  MapPin,
  ArrowRight,
  Truck,
  IndianRupee,
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Calendar,
  Layers,
} from 'lucide-react';

const LoadCardOwner = ({ load, onAssignTransporter, onRevokeAssignment, onCompleteLoad }) => {
  const [bidsModalOpen, setBidsModalOpen] = useState(false);
  const [assigningId, setAssigningId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleAssign = async (transporterId) => {
    setAssigningId(transporterId);
    await onAssignTransporter(load._id, transporterId);
    setAssigningId(null);
    setBidsModalOpen(false);
  };

  const handleRevoke = async () => {
    if (window.confirm('Are you sure you want to revoke transporter assigning? This load will return to Open status.')) {
      setActionLoading(true);
      await onRevokeAssignment(load._id);
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (window.confirm('Confirm receipt of cargo? This will mark the shipment as Delivered and Received.')) {
      setActionLoading(true);
      await onCompleteLoad(load._id);
      setActionLoading(false);
    }
  };

  const interestedCount = load.willingTransporters?.length || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm card-hover animate-fadeIn overflow-hidden flex flex-col">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100">
            {load.category?.slice(0, 3).toUpperCase() || 'FRT'}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">{load.loadName}</h3>
            <span className="text-xs text-slate-500 font-medium">
              Category: {load.category} • Weight: <strong className="text-slate-800">{load.weight} Tons</strong>
            </span>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2">
          {load.status === 'in_progress' ? (
            <StatusBadge driverBadge={load.driverAssignmentBadge} />
          ) : (
            <StatusBadge status={load.status} />
          )}
        </div>
      </div>

      {/* Main Body: Route & Specs */}
      <div className="p-4 sm:p-5 space-y-4 flex-1">
        {/* Route visualization */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Origin / Pickup</div>
            <div className="text-sm font-bold text-slate-900">{load.fromLocation?.city}</div>
            <div className="text-xs text-slate-500 truncate">{load.fromLocation?.state} {load.fromLocation?.address}</div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="flex-1 text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Destination / Drop</div>
            <div className="text-sm font-bold text-slate-900">{load.toLocation?.city}</div>
            <div className="text-xs text-slate-500 truncate">{load.toLocation?.state} {load.toLocation?.address}</div>
          </div>
        </div>

        {/* Vehicle & Payment Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Body & Wheel</span>
            <span className="font-bold text-slate-800 capitalize">
              {load.requiredVehicleType?.replace('_', ' ')} ({load.requiredWheelType}W)
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Permit Type</span>
            <span className="font-bold text-slate-800 uppercase">
              {load.requiredPermitType?.replace('_', ' ')}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Payment Mode</span>
            <span className="font-bold text-slate-800 capitalize">
              {load.amountType?.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
            <span className="text-[10px] text-emerald-700 block font-semibold uppercase">Budget Rate</span>
            <span className="font-extrabold text-emerald-800 text-sm">
              ₹{load.priceRate?.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {load.description && (
          <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 italic">
            "{load.description}"
          </p>
        )}

        {/* Assigned Details Section (For in_progress / completed loads) */}
        {load.assignedTransporter && (
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600" />
                Assigned Transporter:
              </span>
              <span className="font-bold text-slate-900">
                {load.assignedTransporter?.companyName || load.assignedTransporter?.name}
              </span>
            </div>
            <div className="text-[11px] text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
              <span>Contact: {load.assignedTransporter?.phone}</span>
              {load.assignedTransporter?.headLocation && (
                <span>Hub: {load.assignedTransporter?.headLocation}</span>
              )}
            </div>

            {/* Assigned Driver */}
            {load.assignedDriver ? (
              <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-purple-900">Assigned Driver: </span>
                  <span className="font-bold text-slate-900">{load.assignedDriver.name}</span>
                  <span className="text-slate-500 ml-1">({load.assignedDriver.vehicleNumber})</span>
                </div>
                <span className="font-mono text-slate-700 text-[11px]">{load.assignedDriver.phone}</span>
              </div>
            ) : (
              <div className="pt-2 border-t border-blue-100 text-xs text-purple-700 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Transporter is currently assigning a verified driver</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions Based on Status */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 mt-auto">
        <div className="text-xs text-slate-400 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>Posted {new Date(load.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Open State: View Interested Transporters */}
        {load.status === 'open' && (
          <button
            onClick={() => setBidsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition transform active:scale-95"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Interested Transporters: {interestedCount}</span>
          </button>
        )}

        {/* In Progress State: Delete Assigning & Complete actions */}
        {load.status === 'in_progress' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleRevoke}
              disabled={actionLoading}
              title="Revoke assigning and reopen for other transporters"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Assigning</span>
            </button>

            <button
              onClick={handleComplete}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition active:scale-95"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark Received / Recovered</span>
            </button>
          </div>
        )}

        {/* Completed State */}
        {load.status === 'completed' && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Delivered & Verified</span>
          </div>
        )}
      </div>

      {/* Modal: Interested Transporters */}
      <Modal
        isOpen={bidsModalOpen}
        onClose={() => setBidsModalOpen(false)}
        title={`Interested Transporters for "${load.loadName}"`}
        subtitle="Review interested fleet agencies and award the transport contract"
      >
        {interestedCount === 0 ? (
          <div className="text-center py-8 space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-700">No Transporters Have Accepted Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ensure you have connected with transporters in the Transporters Directory so they can see this load on their feed.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {load.willingTransporters?.map((t) => (
              <TransporterBidCard
                key={t._id}
                transporter={t}
                onAssign={handleAssign}
                assigningId={assigningId}
              />
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LoadCardOwner;
