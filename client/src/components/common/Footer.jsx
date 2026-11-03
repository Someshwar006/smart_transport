import React from 'react';
import { Truck, ShieldCheck, PhoneCall, MapPin, Mail, Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Logi<span className="text-blue-500">Connect</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's premier tripartite freight ecosystem connecting industrial cargo owners,
              fleet transporters, and verified lorry drivers seamlessly with zero dead-mileage.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>GST & e-Way Bill Compliant Logistics</span>
            </div>
          </div>

          {/* Col 2: Major Transport Corridors */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">
              National Freight Corridors
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-white transition">Delhi - Mumbai Western Freight Highway (NH 48)</li>
              <li className="hover:text-white transition">Chennai - Bengaluru - Hyderabad Hub</li>
              <li className="hover:text-white transition">Kolkata - Durgapur - Jamshedpur Industrial Belt</li>
              <li className="hover:text-white transition">Pune - Ahmedabad Petrochemical Trunk</li>
              <li className="hover:text-white transition">Nagpur Multi-Modal Central Gateway</li>
            </ul>
          </div>

          {/* Col 3: Role Portals */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">
              Role Workspaces
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-slate-300 font-medium">Load Owners:</span> Direct factory freight dispatch & bidding
              </li>
              <li>
                <span className="text-slate-300 font-medium">Transporters:</span> Fleet route optimization & contract awarding
              </li>
              <li>
                <span className="text-slate-300 font-medium">Lorry Drivers:</span> Guaranteed load matching & transparent rates
              </li>
              <li>
                <span className="text-slate-300 font-medium">Driver Peer Network:</span> Mutual route & road assist
              </li>
            </ul>
          </div>

          {/* Col 4: 24x7 Transport Desk */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">
              Transport Helpdesk
            </h4>
            <p className="text-xs text-slate-400">
              Operating 24/7 across major Indian transport nagars, toll plazas, and check posts.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <PhoneCall className="w-4 h-4 text-blue-400" />
                <span>+91 (080) 4120-7890 / 1800-419-LOGI</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>dispatch@logiconnect.in</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Central Logistics Hub, Electronic City, Bengaluru</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} LogiConnect Freight Systems Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Carrier Terms</span>
            <span className="hover:text-slate-300 cursor-pointer">National Permit Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
