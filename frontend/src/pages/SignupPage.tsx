import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Loader2, User, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '../store';

export function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    login(
      { id: '2', email: form.email, name: form.name, role: 'analyst', createdAt: new Date().toISOString() },
      'mock-jwt-token'
    );
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen cyber-grid-bg flex items-center justify-center p-4">
      <div className="scan-overlay" />
      <div className="fixed top-1/3 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-lg p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(0,212,255,0.2))', border: '2px solid rgba(139,92,246,0.4)' }}>
            <Shield size={28} className="neon-text-purple" />
          </div>
          <h1 className="font-orbitron text-2xl font-bold neon-text-purple">REQUEST ACCESS</h1>
          <p className="text-slate-500 text-sm font-mono-cyber mt-1">AegisAI SOC Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'Security Analyst' },
            { key: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'analyst@company.com' },
            { key: 'password', label: 'Password', icon: Lock, type: showPass ? 'text' : 'password', placeholder: '••••••••' },
            { key: 'confirm', label: 'Confirm Password', icon: Lock, type: showPass ? 'text' : 'password', placeholder: '••••••••' },
          ].map(({ key, label, icon: Icon, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-rajdhani font-semibold uppercase tracking-wider text-slate-400 mb-2">
                {label}
              </label>
              <div className="relative">
                <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="cyber-input rounded pl-9"
                  placeholder={placeholder}
                  required
                />
                {(key === 'password' || key === 'confirm') && (
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {form.confirm && form.password !== form.confirm && (
            <p className="text-threat-red text-xs">Passwords do not match</p>
          )}

          <button type="submit" disabled={loading || form.password !== form.confirm}
            className="btn-cyber-solid w-full rounded flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #00d4ff)' }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="text-center text-slate-500 text-xs">
            Already have access?{' '}
            <Link to="/login" className="text-neon-blue hover:underline">Sign In</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
