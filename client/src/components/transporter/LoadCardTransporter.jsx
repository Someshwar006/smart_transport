import React, { useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import DriverAssignmentModal from './DriverAssignmentModal';
import {
  MapPin,
  ArrowRight,
  Truck,
  IndianRupee,
  Building,
  UserCheck,
  CheckCircle2,
  Clock,
  Phone,
} from 'lucide-react';

const LoadCardTransporter = ({
  load,
  segment, // 'available' | 'progressing' | 'completed'
  currentUserId,
  onAcceptLoad,
  onDriverAssigned,
}) => {
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [accepting, setAccepting] = useState(false);

  const hasExpressedInterest = load.willingTransporters?.some(
    (id) => (typeof id === 'object' ? id._id?.toString() : id?.toString()) === currentUserId?.toString()
  );

  const handleAccept = async () => {
    setAccepting(true);
    await onAcceptLoad(load._id);
    setAccepting(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm card-hover animate-fadeIn overflow-hidden flex flex-col">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 leading-snug">{load.loadName}</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              {load.category}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>Load Owner: <strong className="text-slate-700">{load.loadOwner?.companyName || load.loadOwner?.name}</strong></span>
          </p>
        </div>

        {/* Status / Driver badge */}
        <div>
          {segment === 'available' ? (
            <StatusBadge status="open" />
          ) : segment === 'progressing' ? (
            <StatusBadge driverBadge={load.driverAssignmentBadge} />
          ) : (
            <StatusBadge status="completed" />
          )}
        </div>
      </div>

      {/* Main Specifications */}
      <div className="p-4 sm:p-5 space-y-4 flex-1">
        {/* Route visualization */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Origin City</div>
            <div className="text-sm font-bold text-slate-900">{load.fromLocation?.city}</div>
            <div className="text-xs text-slate-500 truncate">{load.fromLocation?.state}</div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="flex-1 text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Destination City</div>
            <div className="text-sm font-bold text-slate-900">{load.toLocation?.city}</div>
            <div className="text-xs text-slate-500 truncate">{load.toLocation?.state}</div>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Cargo Weight</span>
            <span className="font-bold text-slate-800">{load.weight} Metric Tons</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Body & Wheel</span>
            <span className="font-bold text-slate-800 capitalize">
              {load.requiredVehicleType?.replace('_', ' ')} ({load.requiredWheelType}W)
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Permit Required</span>
            <span className="font-bold text-slate-800 uppercase">
              {load.requiredPermitType?.replace('_', ' ')}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
            <span className="text-[10px] text-emerald-700 block font-semibold uppercase">Offered Budget</span>
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

        {/* Progressing segment: Assigned Driver Display */}
        {segment === 'progressing' && (
          <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-purple-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-purple-600" />
                Assigned Dispatch Driver:
              </span>
              {load.assignedDriver ? (
                <span className="font-bold text-slate-900">{load.assignedDriver.name}</span>
              ) : (
                <span className="text-amber-700 font-semibold text-[11px] bg-amber-100/70 px-2 py-0.5 rounded">
                  Driver Not Yet Assigned
                </span>
              )}
            </div>

            {load.assignedDriver && (
              <div className="text-[11px] text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                <span>Vehicle: <strong className="font-mono text-slate-800">{load.assignedDriver.vehicleNumber}</strong></span>
                <span>Type: {load.assignedDriver.vehicleType?.replace('_', ' ')} ({load.assignedDriver.wheelType}W)</span>
                <span>Phone: {load.assignedDriver.phone}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
        <div className="text-xs text-slate-500">
          Terms: <strong className="capitalize">{load.amountType?.replace(/_/g, ' ')}</strong>
        </div>

        {/* Segment 1: Available Loads */}
        {segment === 'available' && (
          <div>
            {hasExpressedInterest ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Expressed Willing / Awaiting Owner Assignment</span>
              </div>
            ) : (
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{accepting ? 'Submitting...' : "I'm Willing / Accept"}</span>
              </button>
            )}
          </div>
        )}

        {/* Segment 2: Progressing Loads */}
        {segment === 'progressing' && (
          <div>
            {!load.assignedDriver ? (
              <button
                onClick={() => setDriverModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition active:scale-95"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Select & Assign Driver ({load.willingDrivers?.length || 0} Willing)</span>
              </button>
            ) : (
              <button
                onClick={() => setDriverModalOpen(true)}
                className="text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 transition"
              >
                Change Driver
              </button>
            )}
          </div>
        )}

        {/* Segment 3: Completed Loads */}
        {segment === 'completed' && (
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Delivered & Recovered</span>
          </div>
        )}
      </div>

      {/* Driver Assignment Modal */}
      {driverModalOpen && (
        <DriverAssignmentModal
          isOpen={driverModalOpen}
          onClose={() => setDriverModalOpen(false)}
          load={load}
          onDriverAssigned={onDriverAssigned}
        />
      )}
    </div>
  );
};

export default LoadCardTransporter;
