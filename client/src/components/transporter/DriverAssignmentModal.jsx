import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import axiosClient from '../../api/axiosClient';
import { useNotification } from '../../context/NotificationContext';
import { Truck, ShieldCheck, Phone, CheckCircle, AlertCircle, Users } from 'lucide-react';

const DriverAssignmentModal = ({ isOpen, onClose, load, onDriverAssigned }) => {
  const { showSuccess, showError } = useNotification();
  const [assigningDriverId, setAssigningDriverId] = useState(null);
  const [connectedDrivers, setConnectedDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  // Fetch connected drivers to also give transporter the option to directly assign from their pool
  useEffect(() => {
    if (isOpen) {
      const fetchConnectedDrivers = async () => {
        try {
          setLoadingDrivers(true);
          const res = await axiosClient.get('/users?role=driver');
          if (res.data?.success) {
            setConnectedDrivers(res.data.users);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingDrivers(false);
        }
      };
      fetchConnectedDrivers();
    }
  }, [isOpen]);

  const handleAssignDriver = async (driverId) => {
    try {
      setAssigningDriverId(driverId);
      const res = await axiosClient.patch(`/loads/${load._id}/transporter-assign-driver`, {
        driverId,
      });

      if (res.data?.success) {
        showSuccess('Driver assigned successfully! Shipment badge is now LIVE on road.');
        onDriverAssigned(res.data.load);
        onClose();
      }
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to assign driver');
    } finally {
      setAssigningDriverId(null);
    }
  };

  const willingList = load?.willingDrivers || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Driver to "${load?.loadName}"`}
      subtitle={`Route: ${load?.fromLocation?.city} to ${load?.toLocation?.city} (${load?.weight} Tons)`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Segment A: Drivers who clicked "Willing" */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              Drivers Who Expressed Interest ({willingList.length})
            </h4>
            <span className="text-[11px] text-slate-500">Fastest Dispatch Option</span>
          </div>

          {willingList.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-center text-xs text-slate-500">
              No drivers have clicked "Accept / Willing" yet for this load. You can also assign from your connected drivers pool below.
            </div>
          ) : (
            <div className="space-y-2">
              {willingList.map((driver) => (
                <div
                  key={driver._id}
                  className="p-3.5 bg-white rounded-xl border border-purple-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{driver.name}</span>
                        {driver.vehicleNumber && (
                          <span className="text-xs font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                            {driver.vehicleNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-2">
                        <span>Body: {driver.vehicleType?.replace('_', ' ') || 'Any'}</span>
                        <span>Wheels: {driver.wheelType || '10'}W</span>
                        <span>Permit: {driver.permitType?.replace(/_/g, ' ') || 'National'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAssignDriver(driver._id)}
                    disabled={assigningDriverId === driver._id}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50 shrink-0"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {assigningDriverId === driver._id ? 'Assigning...' : 'Confirm Driver'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Segment B: Connected Drivers Pool */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-slate-500" />
            Your Connected Fleet Drivers Pool
          </h4>

          {loadingDrivers ? (
            <div className="text-center py-4 text-xs text-slate-500">Loading drivers directory...</div>
          ) : connectedDrivers.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-center text-xs text-slate-500">
              No connected drivers found. Visit the Drivers Directory to connect with verified lorry drivers.
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {connectedDrivers.map((driver) => {
                const isAlreadyWilling = willingList.some((w) => w._id === driver._id);
                if (isAlreadyWilling) return null; // already displayed in segment A

                return (
                  <div
                    key={driver._id}
                    className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{driver.name}</span>
                        {driver.vehicleNumber && (
                          <span className="text-[11px] font-mono font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            {driver.vehicleNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {driver.vehicleType?.replace('_', ' ')} • {driver.wheelType}W • {driver.phone}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAssignDriver(driver._id)}
                      disabled={assigningDriverId === driver._id}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition shrink-0"
                    >
                      {assigningDriverId === driver._id ? 'Assigning...' : 'Assign Direct'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DriverAssignmentModal;
