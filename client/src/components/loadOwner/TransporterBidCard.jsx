import React from 'react';
import { Truck, MapPin, Phone, UserCheck, ShieldCheck } from 'lucide-react';

const TransporterBidCard = ({ transporter, onAssign, assigningId }) => {
  const isAssigning = assigningId === transporter._id;

  return (
    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {transporter.companyName || transporter.name}
              </h4>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3" /> Verified Partner
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Contact Person: <span className="text-slate-700 font-medium">{transporter.name}</span>
              {transporter.ceoName && ` • CEO: ${transporter.ceoName}`}
            </p>
          </div>
        </div>

        {/* Action: Assign Contract */}
        <button
          onClick={() => onAssign(transporter._id)}
          disabled={isAssigning}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition transform active:scale-95 disabled:opacity-50 shrink-0"
        >
          <UserCheck className="w-3.5 h-3.5" />
          {isAssigning ? 'Assigning...' : 'Assign Contract'}
        </button>
      </div>

      {/* Meta tags */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
        {transporter.headLocation && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Operating Hub: {transporter.headLocation}</span>
          </div>
        )}
        <div className="flex items-center gap-1 font-mono">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span>{transporter.phone}</span>
        </div>
      </div>
    </div>
  );
};

export default TransporterBidCard;
