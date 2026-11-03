import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Truck, Mail, Lock } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState('load_owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password, activeRole);
      showSuccess(`Welcome back, ${user.name}!`);

      // Always navigate to the overall home page
      navigate('/');
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200/90 shadow-xl animate-slideUp">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-600/20 transform transition hover:scale-105 duration-300">
            <Truck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Log into LogiConnect
          </h2>
          <p className="text-xs text-slate-500">
            Select your enterprise role to access your dedicated operations dashboard
          </p>
        </div>

        {/* Top Gate: 3 Role Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveRole('load_owner')}
            className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              activeRole === 'load_owner'
                ? 'bg-white text-blue-600 shadow-sm scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Load Owner
          </button>
          <button
            type="button"
            onClick={() => setActiveRole('transporter')}
            className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              activeRole === 'transporter'
                ? 'bg-white text-blue-600 shadow-sm scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Transporter
          </button>
          <button
            type="button"
            onClick={() => setActiveRole('driver')}
            className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              activeRole === 'driver'
                ? 'bg-white text-blue-600 shadow-sm scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lorry Driver
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Registered Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50 mt-2 hover:shadow-lg hover:shadow-blue-600/20"
          >
            {loading ? 'Authenticating...' : `Log In as ${activeRole.replace('_', ' ').toUpperCase()}`}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 text-xs text-slate-600">
          Don't have a verified account yet?{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:underline">
            Register your fleet or company
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
