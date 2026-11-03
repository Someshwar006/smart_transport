import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Truck,
  PlusCircle,
  LogOut,
  User,
  Menu,
  X,
  Package,
  Users,
  Compass,
  Layers,
  ShieldCheck,
} from 'lucide-react';

const Navbar = ({ onOpenPostLoad }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const renderNavLinks = (isMobile = false) => {
    const baseClass = isMobile
      ? 'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition'
      : 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition';

    if (!isAuthenticated) {
      // Remove duplicate center Home, Login, Register on desktop navbar
      if (!isMobile) {
        return null;
      }
      return (
        <div className="flex flex-col gap-2 pt-2">
          <Link
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
          >
            Log in
          </Link>
          <Link
            to="/register"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md"
          >
            Register
          </Link>
        </div>
      );
    }

    // Role-specific links
    return (
      <>
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className={`${baseClass} ${
            isActive('/') ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Home
        </Link>

        {user.role === 'load_owner' && (
          <>
            <Link
              to="/owner/loads"
              onClick={() => setMobileMenuOpen(false)}
              className={`${baseClass} ${
                isActive('/owner/loads') ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Package className="w-4 h-4" />
              My Loads
            </Link>
            <Link
              to="/owner/transporters"
              onClick={() => setMobileMenuOpen(false)}
              className={`${baseClass} ${
                isActive('/owner/transporters') ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Truck className="w-4 h-4" />
              Transporters
            </Link>
            <Link
              to="/owner/drivers"
              onClick={() => setMobileMenuOpen(false)}
              className={`${baseClass} ${
                isActive('/owner/drivers') ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              Drivers (Friends)
            </Link>
          </>
        )}

        {user.role === 'transporter' && (
          <>
            <Link
              to="/transporter/loads"
              onClick={() => setMobileMenuOpen(false)}
              className={`${baseClass} ${
                isActive('/transporter/loads') ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4" />
              My Loads
            </Link>
            <Link
              to="/transporter/drivers"
              onClick={() => setMobileMenuOpen(false)}
              className={`${baseClass} ${
                isActive('/transporter/drivers') ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              Drivers Directory
            </Link>
            <Link
              to="/transporter/owners"
              onClick={() => setMobileMenuOpen(false)}
              className={`${baseClass} ${
                isActive('/transporter/owners') ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Truck className="w-4 h-4" />
              Owners Connect
            </Link>
          </>
        )}

        {user.role === 'driver' && (
          <>
            <Link
              to="/driver/available-loads"
              onClick={() => setMobileMenuOpen(false)}
              className={`${baseClass} ${
                isActive('/driver/available-loads') ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4" />
              Available Loads
            </Link>
            <Link
              to="/driver/transporters"
              onClick={() => setMobileMenuOpen(false)}
              className={`${baseClass} ${
                isActive('/driver/transporters') ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Truck className="w-4 h-4" />
              Transporters
            </Link>
            <Link
              to="/driver/friends"
              onClick={() => setMobileMenuOpen(false)}
              className={`${baseClass} ${
                isActive('/driver/friends') ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              Driver Friends
            </Link>
          </>
        )}

        <Link
          to="/profile"
          onClick={() => setMobileMenuOpen(false)}
          className={`${baseClass} ${
            isActive('/profile') ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4" />
          Profile
        </Link>
      </>
    );
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'load_owner':
        return { label: 'Load Owner', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'transporter':
        return { label: 'Transporter', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'driver':
        return { label: 'Lorry Driver', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: role, color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md shadow-slate-900/10 group-hover:bg-blue-600 transition-colors">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center">
                Logi<span className="text-blue-600">Connect</span>
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 -mt-1">
                Indian Freight Network
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {renderNavLinks(false)}
          </nav>

          {/* Right Action Trigger (Post load / Profile badge / Logout) */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {user.role === 'load_owner' && onOpenPostLoad && (
                  <button
                    onClick={onOpenPostLoad}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition transform active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Post a Load
                  </button>
                )}

                {/* User tag & logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center uppercase">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-800 leading-tight">
                        {user.name?.split(' ')[0]}
                      </div>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${
                          getRoleBadge(user.role).color
                        }`}
                      >
                        {getRoleBadge(user.role).label}
                      </span>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    title="Log Out"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex items-center md:hidden gap-2">
            {isAuthenticated && user.role === 'load_owner' && onOpenPostLoad && (
              <button
                onClick={onOpenPostLoad}
                className="p-2 bg-blue-600 text-white rounded-lg"
                title="Post a Load"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200 shadow-xl">
          {isAuthenticated && (
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 px-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center uppercase">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{user.name}</div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${
                      getRoleBadge(user.role).color
                    }`}
                  >
                    {getRoleBadge(user.role).label}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1">{renderNavLinks(true)}</div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
