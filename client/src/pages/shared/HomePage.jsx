import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Truck,
  Package,
  Users,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  PhoneCall,
  CheckCircle2,
  Layers,
  ChevronRight,
  Award,
} from 'lucide-react';

const HomePage = ({ onOpenPostLoad }) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-16 pb-20 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-7 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Next-Generation Indian Tripartite Freight Ecosystem</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
            Intelligent Logistics for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400">
              Cargo Owners, Fleets & Drivers
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed mx-auto">
            Eliminate freight broker inefficiencies and dead-mileage. LogiConnect empowers
            Indian industrial shippers to post live cargo, lets fleet transporters contract
            verified routes, and assigns licensed lorry drivers seamlessly with transparent pricing.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {isAuthenticated ? (
              <>
                {user.role === 'load_owner' && (
                  <button
                    onClick={onOpenPostLoad}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition transform active:scale-95"
                  >
                    <Package className="w-4 h-4" />
                    Post a Freight Load
                  </button>
                )}
                <Link
                  to={
                    user.role === 'load_owner'
                      ? '/owner/loads'
                      : user.role === 'transporter'
                      ? '/transporter/loads'
                      : '/driver/available-loads'
                  }
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
                >
                  Go to Your Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/30 transition transform active:scale-95"
                >
                  <span>Join Network (Free)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
                >
                  Operations Login
                </Link>
              </>
            )}
          </div>

          {/* Trust Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>GST & e-Way Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Verified VAHAN Registrations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>All-India Corridor Permits</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Metric Counters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-lg card-hover text-center space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Tonnage Moved
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">142,500+</div>
            <span className="text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Metric Tons Monthly
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-lg card-hover text-center space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Verified Transporters
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">3,850+</div>
            <span className="text-xs text-blue-600 font-semibold">Registered Fleet Agencies</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-lg card-hover text-center space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              National Fleet Count
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">24,200+</div>
            <span className="text-xs text-purple-600 font-semibold">Containers & Multi-Axles</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-lg card-hover text-center space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Trips Completed
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">99.4%</div>
            <span className="text-xs text-emerald-600 font-semibold">On-Time Safe Delivery</span>
          </div>
        </div>
      </section>

      {/* "How It Works" 3-Party Tripartite Flowchart */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Tripartite Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            How LogiConnect Streamlines National Freight
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            A synchronized 3-party contract workflow eliminating middlemen commission and lost transit time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1: Load Owner */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm card-hover hover:border-blue-400 space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-lg border border-indigo-100">
              1
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Phase 1: Cargo Generation
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Industrial Load Owner</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Factory or cargo consignor posts shipment with exact route, tonnage, vehicle type, and budget.
              Dispatched directly to connected, verified transport fleets.
            </p>
            <div className="pt-2 border-t border-slate-100 text-xs font-semibold text-indigo-700 flex items-center gap-1">
              <span>Reviews bids & awards contract</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Step 2: Transporter */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm card-hover hover:border-blue-400 space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-lg border border-blue-100">
              2
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Phase 2: Fleet Contract
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Transporter Fleet Agency</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transporters review available loads in their operating hub, click "Accept / Show Interest",
              and once contracted, assign a verified lorry driver from their network.
            </p>
            <div className="pt-2 border-t border-slate-100 text-xs font-semibold text-blue-700 flex items-center gap-1">
              <span>Dispatches driver & turns load LIVE</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Step 3: Lorry Driver */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm card-hover hover:border-blue-400 space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold text-lg border border-emerald-100">
              3
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Phase 3: Road Execution
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Licensed Lorry Driver</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Drivers view contracted loads, confirm willingness with 1 tap, transport cargo safely under
              all-India permits, and receipt is acknowledged directly by the consignor.
            </p>
            <div className="pt-2 border-t border-slate-100 text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <span>Safe delivery verified & completed</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="bg-slate-100/70 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Engineered for the Indian Road Transport Landscape
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Addressing real-world challenges from phone spam to permit verification and prompt payments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Privacy-First Contact Shield</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No unsolicited calls from rogue brokers. Contact numbers remain masked (+91 ••••• ••345)
                until mutual connection requests are formally accepted.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Zero Dead-Mileage Matching</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Drivers and transporters can locate return-loads prior to reaching unloading docks,
                maximizing fleet asset utilization and vehicle earnings.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Driver Peer Community</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lorry drivers connect with peers across interstate corridors for breakdown assistance,
                toll updates, safe dhabha parking, and mutual navigation support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Real Voices from the Highway
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">Trusted Across India's Corridors</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <p className="text-xs text-slate-600 italic leading-relaxed">
              "We dispatch 200+ metric tons of finished automotive components weekly from Chennai to Pune.
              LogiConnect allows us to contract trusted transporters directly with clear rate transparency."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                RK
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">R. Krishnan</div>
                <div className="text-[10px] text-slate-500">Logistics Head, Apex Auto Ancillaries</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <p className="text-xs text-slate-600 italic leading-relaxed">
              "Managing 80 multi-axle trailers was a constant telephone headache. With LogiConnect,
              my dispatch team connects with vetted load owners and assigns licensed drivers in minutes."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                VS
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Vikramaditya Sharma</div>
                <div className="text-[10px] text-slate-500">Director, Sharma Freightways, Indore</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <p className="text-xs text-slate-600 italic leading-relaxed">
              "As a 14-wheeler container driver, I used to wait 3 to 4 days at transport nagars for return loads.
              Now I check Available Loads on my phone, click Willing, and leave the same day."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                MS
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Manpreet Singh</div>
                <div className="text-[10px] text-slate-500">Owner-Driver (NL-01-AIP)</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
