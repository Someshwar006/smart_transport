import React, { useState, useEffect, useMemo } from 'react';
import axiosClient from '../../api/axiosClient';
import { useNotification } from '../../context/NotificationContext';
import {
  Truck,
  Building,
  Users,
  Search,
  MapPin,
  Phone,
  PhoneCall,
  UserPlus,
  Clock,
  Check,
  X,
  ShieldCheck,
  Lock,
  Filter,
  RotateCw,
  Sparkles,
  Loader2,
  ArrowRight,
  UserX,
} from 'lucide-react';

const DirectoryManager = ({
  targetRole,
  pageTitle,
  pageSubtitle,
  roleDisplayName,
  badgeText,
  icon: HeaderIcon = Users,
}) => {
  const { showSuccess, showError } = useNotification();

  // Primary Tab State: 'connected' (Default Active View) | 'explore'
  const [activeTab, setActiveTab] = useState('connected');

  // Segregated Directory State
  const [connected, setConnected] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [explore, setExplore] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('');
  const [wheelTypeFilter, setWheelTypeFilter] = useState('');

  // Tracks active loading ID for user or connection in-flight
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Fetch segregated directory from atomic endpoint
  const fetchDirectory = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/connections/directory/${targetRole}`);
      if (res.data?.success) {
        setConnected(res.data.connected || []);
        setIncomingRequests(res.data.incomingRequests || []);
        setExplore(res.data.explore || []);
      }
    } catch (err) {
      console.error('[Directory Fetch Error]:', err);
      showError(err.response?.data?.message || `Failed to fetch ${roleDisplayName}s directory`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, [targetRole]);

  // Helper to mask phone numbers locally
  const maskPhone = (phone) => {
    if (!phone) return 'Not Provided';
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length < 4) return '+91 ••••• ••••';
    const last4 = clean.slice(-4);
    return `+91 ••••• ••${last4}`;
  };

  // 1. STATE 1 -> STATE 2: SEND CONNECTION REQUEST ("idle" -> "processing")
  const handleSendRequest = async (targetUserId, targetUserName) => {
    try {
      setActionLoadingId(targetUserId);

      // Optimistic update: card immediately flips to "processing" in Explore tab
      setExplore((prev) =>
        prev.map((item) =>
          item._id.toString() === targetUserId.toString()
            ? { ...item, connectionState: 'processing', connectionStatus: 'pending_sent' }
            : item
        )
      );

      const res = await axiosClient.post('/connections/request', { recipientId: targetUserId });
      if (res.data?.success) {
        showSuccess(`Connection request dispatched to ${targetUserName || roleDisplayName}!`);
        const newConnId = res.data.connection?._id;
        setExplore((prev) =>
          prev.map((item) =>
            item._id.toString() === targetUserId.toString()
              ? {
                  ...item,
                  connectionState: 'processing',
                  connectionStatus: 'pending_sent',
                  connectionId: newConnId || item.connectionId,
                }
              : item
          )
        );
      }
    } catch (err) {
      console.error('[Send Request Error]:', err);
      showError(err.response?.data?.message || 'Failed to dispatch connection request');
      // Rollback optimistic state if failed
      setExplore((prev) =>
        prev.map((item) =>
          item._id.toString() === targetUserId.toString()
            ? { ...item, connectionState: 'idle', connectionStatus: 'none' }
            : item
        )
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // 2. STATE 2 -> STATE 3 OR ROLLBACK: RESPOND TO REQUEST ("accept" OR "ignore")
  const handleRespond = async (connectionId, action, userItem) => {
    try {
      setActionLoadingId(connectionId || userItem._id);
      const res = await axiosClient.patch(`/connections/respond/${connectionId}`, { action });

      if (res.data?.success) {
        if (action === 'accept') {
          showSuccess(`Connection accepted with ${userItem.name}! Added to Connected tab.`);

          // Remove from incoming requests banner
          setIncomingRequests((prev) =>
            prev.filter(
              (req) => req.connectionId !== connectionId && req._id.toString() !== userItem._id.toString()
            )
          );

          // Remove card completely from Explore tab
          setExplore((prev) =>
            prev.filter((item) => item._id.toString() !== userItem._id.toString())
          );

          // Add card into Connected tab with verified unmasked details
          const partnerData = res.data.partner || {};
          const acceptedCard = {
            ...userItem,
            ...partnerData,
            connectionId,
            connectionState: 'accepted',
            connectionStatus: 'accepted',
            isPhoneMasked: false,
          };

          setConnected((prev) => [
            acceptedCard,
            ...prev.filter((u) => u._id.toString() !== userItem._id.toString()),
          ]);
        } else {
          // ACTION: "ignore" -> Rollback to idle
          showSuccess(`Connection request ignored.`);

          // Remove from incoming requests banner
          setIncomingRequests((prev) =>
            prev.filter(
              (req) => req.connectionId !== connectionId && req._id.toString() !== userItem._id.toString()
            )
          );

          // Rollback candidate in Explore tab to "idle" (with Request button)
          setExplore((prev) =>
            prev.map((item) =>
              item._id.toString() === userItem._id.toString()
                ? {
                    ...item,
                    connectionState: 'idle',
                    connectionStatus: 'none',
                    connectionId: null,
                  }
                : item
            )
          );
        }
      }
    } catch (err) {
      console.error('[Respond Error]:', err);
      showError(err.response?.data?.message || 'Failed to update connection request');
    } finally {
      setActionLoadingId(null);
    }
  };

  // 3. STATE 3 -> STATE 1: BREAK MUTUAL CONNECTION
  const handleBreakConnection = async (targetUserId, connectionId, targetUserName) => {
    try {
      setActionLoadingId(targetUserId);
      const res = await axiosClient.delete(`/connections/break/${targetUserId}`);

      if (res.data?.success) {
        showSuccess(`Connection with ${targetUserName || roleDisplayName} broken. Returned to Explore.`);

        // Find candidate in connected list
        const disconnectedUser = connected.find(
          (u) => u._id.toString() === targetUserId.toString()
        );

        // Remove from Connected tab immediately
        setConnected((prev) => prev.filter((u) => u._id.toString() !== targetUserId.toString()));

        // Add back to Explore tab with "idle" state
        if (disconnectedUser) {
          const isPublic = disconnectedUser.privacySetting === 'public';
          const restoredExploreCard = {
            ...disconnectedUser,
            connectionState: 'idle',
            connectionStatus: 'none',
            connectionId: null,
            isPhoneMasked: !isPublic,
            phone: !isPublic ? maskPhone(disconnectedUser.phone) : disconnectedUser.phone,
          };

          setExplore((prev) => {
            const alreadyInExplore = prev.some((u) => u._id.toString() === targetUserId.toString());
            if (alreadyInExplore) {
              return prev.map((u) =>
                u._id.toString() === targetUserId.toString() ? restoredExploreCard : u
              );
            }
            return [restoredExploreCard, ...prev];
          });
        }
      }
    } catch (err) {
      console.error('[Break Connection Error]:', err);
      showError(err.response?.data?.message || 'Failed to break connection');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter helper for search query & driver specs
  const filterList = (list) => {
    const q = search.trim().toLowerCase();
    return list.filter((user) => {
      // Role-specific filters
      if (targetRole === 'driver') {
        if (vehicleTypeFilter && user.vehicleType !== vehicleTypeFilter) return false;
        if (wheelTypeFilter && String(user.wheelType) !== String(wheelTypeFilter)) return false;
      }

      if (!q) return true;

      const nameMatch = user.name?.toLowerCase().includes(q);
      const companyMatch = user.companyName?.toLowerCase().includes(q);
      const ceoMatch = user.ceoName?.toLowerCase().includes(q);
      const locMatch = user.headLocation?.toLowerCase().includes(q);
      const vehNumMatch = user.vehicleNumber?.toLowerCase().includes(q);
      const vehTypeMatch = user.vehicleType?.toLowerCase().includes(q);
      const permitMatch = user.permitType?.toLowerCase().includes(q);

      return (
        nameMatch ||
        companyMatch ||
        ceoMatch ||
        locMatch ||
        vehNumMatch ||
        vehTypeMatch ||
        permitMatch
      );
    });
  };

  const filteredConnected = useMemo(() => filterList(connected), [
    connected,
    search,
    vehicleTypeFilter,
    wheelTypeFilter,
  ]);

  const filteredExplore = useMemo(() => filterList(explore), [
    explore,
    search,
    vehicleTypeFilter,
    wheelTypeFilter,
  ]);

  // Render Action Button Area on Card
  const renderCardActions = (user, isConnectedTab = false) => {
    const state = user.connectionState || (user.connectionStatus === 'accepted' ? 'accepted' : 'idle');
    const isActing = Boolean(
      actionLoadingId &&
        (String(actionLoadingId) === String(user._id) ||
          (user.connectionId && String(actionLoadingId) === String(user.connectionId)))
    );

    // View in Connected Tab: Show "Connected" badge and "Break Connection" option
    if (isConnectedTab || state === 'accepted') {
      return (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 shadow-sm">
            <Check className="w-3.5 h-3.5 text-emerald-600" /> Connected
          </span>
          <button
            onClick={() =>
              handleBreakConnection(user._id, user.connectionId, user.companyName || user.name)
            }
            disabled={isActing}
            className="text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50 inline-flex items-center gap-1"
          >
            {isActing ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Breaking...</span>
              </>
            ) : (
              <>
                <UserX className="w-3 h-3" />
                <span>Break Connection</span>
              </>
            )}
          </button>
        </div>
      );
    }

    // View in Explore Tab: State 2A - Sender View: "Processing..." (remains until receiver accepts)
    if (state === 'processing') {
      return (
        <button
          disabled
          className="bg-amber-50 text-amber-800 border border-amber-300 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-not-allowed opacity-90 inline-flex items-center gap-1.5 shadow-sm"
          title="Connection request sent. Awaiting receiver confirmation."
        >
          <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
          <span>Processing...</span>
        </button>
      );
    }

    // View in Explore Tab: State 2B - Receiver View: "Accept" and "Ignore"
    if (state === 'received_pending') {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRespond(user.connectionId, 'ignore', user)}
            disabled={isActing}
            className="bg-slate-200 text-slate-700 hover:bg-slate-300 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50"
          >
            Ignore
          </button>
          <button
            onClick={() => handleRespond(user.connectionId, 'accept', user)}
            disabled={isActing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition active:scale-95 disabled:opacity-50 disabled:cursor-wait inline-flex items-center gap-1.5"
          >
            {isActing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Accepting...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Accept</span>
              </>
            )}
          </button>
        </div>
      );
    }

    // View in Explore Tab: State 1 - Idle Unconnected: "Connect"
    return (
      <button
        onClick={() => handleSendRequest(user._id, user.companyName || user.name)}
        disabled={isActing}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50 disabled:cursor-wait"
      >
        {isActing ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <UserPlus className="w-3.5 h-3.5" />
            <span>Connect</span>
          </>
        )}
      </button>
    );
  };

  // Render Business / Enterprise Card (Load Owner or Transporter)
  const renderBusinessCard = (user, isConnectedTab = false) => {
    const isReceiverPending = user.connectionState === 'received_pending' && !isConnectedTab;

    return (
      <div
        key={user._id}
        className={`bg-white rounded-2xl border p-5 flex flex-col justify-between space-y-4 card-hover animate-fadeIn transition-all ${
          isReceiverPending
            ? 'border-indigo-300 ring-2 ring-indigo-50 shadow-md'
            : 'border-slate-200/90 shadow-sm'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 font-bold">
                {targetRole === 'transporter' ? (
                  <Truck className="w-6 h-6" />
                ) : (
                  <Building className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {user.companyName || user.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Officer: <span className="text-slate-800 font-medium">{user.name}</span>
                  {user.ceoName && ` • CEO: ${user.ceoName}`}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
              <ShieldCheck className="w-3 h-3" /> Verified
            </span>
          </div>

          {/* Incoming Request Ribbon on Explore card */}
          {isReceiverPending && (
            <div className="mt-3 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/80 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-600" />
                <span>Sent you a connection request</span>
              </span>
              <span className="text-[10px] text-indigo-600 uppercase font-bold tracking-wider">
                Awaiting Decision
              </span>
            </div>
          )}

          {user.headLocation && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-3 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                Hub: <strong>{user.headLocation}</strong>
              </span>
            </div>
          )}

          {user.description && (
            <p className="text-xs text-slate-600 italic mt-2.5 line-clamp-2">
              "{user.description}"
            </p>
          )}
        </div>

        {/* Card Footer: Contact Privacy + State Actions */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span
              className={
                isConnectedTab ? 'text-slate-800 font-bold' : 'text-slate-400 font-semibold'
              }
            >
              {isConnectedTab
                ? user.phone || 'Not Provided'
                : maskPhone(user.phone)}
            </span>
            {!isConnectedTab ? (
              <span title="Connect to unmask direct phone number" className="cursor-help">
                <Lock className="w-3 h-3 text-amber-500" />
              </span>
            ) : (
              user.phone && (
                <a
                  href={`tel:${user.phone}`}
                  className="ml-1 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition"
                >
                  <PhoneCall className="w-3 h-3" /> Call
                </a>
              )
            )}
          </div>

          <div>{renderCardActions(user, isConnectedTab)}</div>
        </div>
      </div>
    );
  };

  // Render Driver Card (Individual Fleet Operator)
  const renderDriverCard = (user, isConnectedTab = false) => {
    const isReceiverPending = user.connectionState === 'received_pending' && !isConnectedTab;

    return (
      <div
        key={user._id}
        className={`bg-white rounded-2xl border p-5 flex flex-col justify-between space-y-4 card-hover animate-fadeIn transition-all ${
          isReceiverPending
            ? 'border-indigo-300 ring-2 ring-indigo-50 shadow-md'
            : 'border-slate-200/90 shadow-sm'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 font-bold text-base">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{user.name}</h4>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Certified Driver
                  </span>
                </div>

                {user.vehicleNumber && (
                  <div className="mt-1 inline-block font-mono text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded shadow-sm">
                    {user.vehicleNumber}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Incoming Request Ribbon on Explore card */}
          {isReceiverPending && (
            <div className="mt-3 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/80 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-600" />
                <span>Driver requested connection</span>
              </span>
              <span className="text-[10px] text-indigo-600 uppercase font-bold tracking-wider">
                Awaiting Decision
              </span>
            </div>
          )}

          {/* Vehicle Specs Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 mt-3">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                Body Style
              </span>
              <span className="font-bold text-slate-800 capitalize">
                {user.vehicleType?.replace(/_/g, ' ') || 'Multi-Utility'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                Axle / Wheels
              </span>
              <span className="font-bold text-slate-800">
                {user.wheelType || '10'} Wheeler
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                Permit Class
              </span>
              <span className="font-bold text-slate-800 uppercase">
                {user.permitType?.replace(/_/g, ' ') || 'National Permit'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                License
              </span>
              <span className="font-mono font-bold text-slate-800 uppercase">
                {user.licenseNumber || 'Verified HMV'}
              </span>
            </div>
          </div>

          {user.headLocation && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-2.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                Base: <strong>{user.headLocation}</strong>
              </span>
            </div>
          )}

          {user.description && (
            <p className="text-xs text-slate-600 italic line-clamp-2 mt-2">
              "{user.description}"
            </p>
          )}
        </div>

        {/* Card Footer: Phone + Dynamic State Action */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span
              className={
                isConnectedTab ? 'text-slate-800 font-bold' : 'text-slate-400 font-semibold'
              }
            >
              {isConnectedTab
                ? user.phone || 'Not Provided'
                : maskPhone(user.phone)}
            </span>
            {!isConnectedTab ? (
              <span title="Connect to unmask direct phone number" className="cursor-help">
                <Lock className="w-3 h-3 text-amber-500" />
              </span>
            ) : (
              user.phone && (
                <a
                  href={`tel:${user.phone}`}
                  className="ml-1 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition"
                >
                  <PhoneCall className="w-3 h-3" /> Call
                </a>
              )
            )}
          </div>

          <div>{renderCardActions(user, isConnectedTab)}</div>
        </div>
      </div>
    );
  };

  const renderCard = (user, isConnectedTab = false) => {
    return targetRole === 'driver'
      ? renderDriverCard(user, isConnectedTab)
      : renderBusinessCard(user, isConnectedTab);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{pageTitle}</h1>
            {badgeText && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> {badgeText}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">{pageSubtitle}</p>
        </div>

        <button
          onClick={fetchDirectory}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition self-start sm:self-auto active:scale-95"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Top Segment Switcher: Segment 1 "Connected" vs Segment 2 "Explore" */}
      <div className="flex items-center p-1.5 bg-slate-100 rounded-2xl w-full sm:max-w-md">
        <button
          onClick={() => setActiveTab('connected')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
            activeTab === 'connected'
              ? 'bg-white text-blue-700 shadow-sm scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>Connected ({connected.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('explore')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all relative ${
            activeTab === 'explore'
              ? 'bg-white text-blue-700 shadow-sm scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Explore ({explore.length})</span>
          {incomingRequests.length > 0 && (
            <span className="ml-1 text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded-full shadow-sm animate-pulse">
              {incomingRequests.length} pending
            </span>
          )}
        </button>
      </div>

      {/* Notification Banner: Pending Requests ({count}) - Visible ONLY if incoming requests exist */}
      {incomingRequests.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50 border border-blue-200 rounded-2xl p-5 shadow-sm space-y-4 animate-slideDown">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  Pending Connection Requests ({incomingRequests.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Accept or ignore partnership requests below or directly on their Explore cards.
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 self-start sm:self-auto">
              <Clock className="w-3 h-3" /> Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {incomingRequests.map((reqUser) => {
              const isResponding = Boolean(
                actionLoadingId &&
                  (String(actionLoadingId) === String(reqUser.connectionId) ||
                    String(actionLoadingId) === String(reqUser._id))
              );

              return (
                <div
                  key={reqUser._id}
                  className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-3"
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
                            {reqUser.role?.replace(/_/g, ' ')}
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

                  {/* Immediate Action Triggers: Primary "Accept" and Secondary "Ignore" */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleRespond(reqUser.connectionId, 'ignore', reqUser)}
                      disabled={isResponding}
                      className="bg-slate-200 text-slate-700 hover:bg-slate-300 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition disabled:opacity-50"
                    >
                      Ignore
                    </button>
                    <button
                      onClick={() => handleRespond(reqUser.connectionId, 'accept', reqUser)}
                      disabled={isResponding}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                    >
                      {isResponding ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Real-time Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              targetRole === 'driver'
                ? 'Search by Name, Reg Number, Body Type...'
                : 'Search by Company, Officer, CEO, or Hub...'
            }
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50/50"
          />
        </div>

        {/* Optional Driver Filters */}
        {targetRole === 'driver' && (
          <div className="flex items-center gap-2 text-xs flex-wrap w-full sm:w-auto">
            <span className="font-semibold text-slate-600 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              Filter:
            </span>
            <select
              value={vehicleTypeFilter}
              onChange={(e) => setVehicleTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Body Styles</option>
              <option value="box_container">Closed Container</option>
              <option value="tarpaulin">Tarpaulin Truck</option>
              <option value="flatbed">Flatbed Trailer</option>
              <option value="open_tipper">Open Tipper</option>
            </select>

            <select
              value={wheelTypeFilter}
              onChange={(e) => setWheelTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Wheel Counts</option>
              <option value="6">6 Wheeler</option>
              <option value="10">10 Wheeler</option>
              <option value="12">12 Wheeler</option>
              <option value="14">14 Wheeler</option>
              <option value="16">16 Wheeler</option>
              <option value="18">18 Wheeler</option>
              <option value="22">22 Wheeler</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">
            Loading {roleDisplayName.toLowerCase()} network...
          </p>
        </div>
      ) : activeTab === 'connected' ? (
        /* SEGMENT 1: CONNECTED VIEW */
        connected.length === 0 ? (
          /* Empty State Fallback */
          <div className="bg-white rounded-2xl border border-slate-200 p-10 sm:p-12 text-center space-y-4 max-w-md mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <HeaderIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                No Connected {roleDisplayName}s Yet
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                You haven't connected with any {roleDisplayName.toLowerCase()} yet. Discover and
                partner with verified members to start dispatching.
              </p>
            </div>
            <div>
              <button
                onClick={() => setActiveTab('explore')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm active:scale-95"
              >
                <span>Explore {roleDisplayName}s</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : filteredConnected.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2 max-w-md mx-auto">
            <p className="text-xs text-slate-500">
              No connected {roleDisplayName.toLowerCase()} matches your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredConnected.map((user) => renderCard(user, true))}
          </div>
        )
      ) : (
        /* SEGMENT 2: EXPLORE VIEW */
        explore.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 sm:p-12 text-center space-y-3 max-w-md mx-auto">
            <HeaderIcon className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No {roleDisplayName}s Found</h3>
            <p className="text-xs text-slate-500">
              There are currently no other registered {roleDisplayName.toLowerCase()}s on the platform.
            </p>
          </div>
        ) : filteredExplore.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2 max-w-md mx-auto">
            <p className="text-xs text-slate-500">
              No {roleDisplayName.toLowerCase()} matches your query. Try clearing filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredExplore.map((user) => renderCard(user, false))}
          </div>
        )
      )}
    </div>
  );
};

export default DirectoryManager;
