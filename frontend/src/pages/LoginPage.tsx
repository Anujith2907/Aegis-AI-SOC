import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store';
import { authAPI } from '../api';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const res = await authAPI.login(email, password);
      const { access_token, user } = res.data;
      login(
        { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: new Date().toISOString() },
        access_token
      );
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen cyber-grid-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="scan-overlay" />

      {/* Background orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00d4ff, transparent)' }} />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center relative"
            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(139,92,246,0.15))', border: '2px solid rgba(0,212,255,0.4)', boxShadow: '0 0 40px rgba(0,212,255,0.2)' }}>
            <Shield size={36} className="neon-text-blue" />
            <div className="absolute inset-0 rounded-2xl animate-pulse" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.05), rgba(139,92,246,0.05))' }} />
          </div>
          <h1 className="font-orbitron text-3xl font-bold neon-text-blue tracking-wider">AEGISAI SOC</h1>
          <p className="font-orbitron text-xs text-slate-400 tracking-[0.4em] mt-1">AI SECURITY PLATFORM</p>
        </motion.div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-8"
          style={{ boxShadow: '0 0 60px rgba(0,212,255,0.06), 0 25px 50px rgba(0,0,0,0.5)' }}
        >
          <div className="mb-6">
            <h2 className="font-rajdhani text-xl font-bold text-slate-200">Secure Access Portal</h2>
            <p className="text-slate-500 text-sm font-mono-cyber mt-1">Authenticate to access the SOC dashboard</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 p-3 rounded mb-4 text-sm"
              style={{ background: 'rgba(255,34,68,0.1)', border: '1px solid rgba(255,34,68,0.3)', color: '#ff2244' }}>
              <AlertCircle size={14} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-rajdhani font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="cyber-input rounded-lg pl-9 w-full"
                  placeholder="analyst@company.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-rajdhani font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="cyber-input rounded-lg pl-9 pr-10 w-full"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-neon-blue hover:text-neon-blue/80 font-mono-cyber transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-cyber-solid w-full rounded-lg flex items-center justify-center gap-2 py-3 font-rajdhani font-bold text-base disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Authenticating...</>
              ) : (
                <><Shield size={18} /> Access Dashboard</>
              )}
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'rgba(0,212,255,0.1)' }} />
              <span className="text-xs text-slate-600 font-mono-cyber">OR</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(0,212,255,0.1)' }} />
            </div>

            {/* Sign up link */}
            <div className="text-center text-sm text-slate-500">
              Need access?{' '}
              <Link to="/signup" className="text-neon-blue hover:text-neon-blue/80 font-semibold transition-colors">
                Request credentials
              </Link>
            </div>
          </form>
        </motion.div>


      </div>
    </div>
  );
}
