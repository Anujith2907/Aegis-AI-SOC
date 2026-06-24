import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen cyber-grid-bg flex items-center justify-center p-4">
      <div className="scan-overlay" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(139,92,246,0.15)', border: '2px solid rgba(139,92,246,0.4)' }}>
            {sent ? <CheckCircle size={28} className="text-cyber-green" /> : <Mail size={28} className="neon-text-purple" />}
          </div>
          <h1 className="font-orbitron text-2xl font-bold neon-text-purple">
            {sent ? 'CHECK YOUR EMAIL' : 'RESET ACCESS'}
          </h1>
          <p className="text-slate-500 text-sm font-mono-cyber mt-2">
            {sent
              ? 'Reset instructions have been transmitted securely.'
              : 'Enter your registered email to receive reset instructions.'}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-rajdhani font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Email Address
              </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="cyber-input rounded" placeholder="analyst@aegisai.soc" required />
            </div>
            <button type="submit" disabled={loading}
              className="btn-cyber-solid w-full rounded flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #00d4ff)' }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="p-4 rounded mb-4" style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)' }}>
              <p className="text-sm text-cyber-green font-mono-cyber">Reset link sent to {email}</p>
            </div>
            <button onClick={() => setSent(false)} className="btn-cyber rounded px-4 py-2 text-sm">
              Try different email
            </button>
          </div>
        )}

        <Link to="/login" className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-500 hover:text-neon-blue transition-colors">
          <ArrowLeft size={14} />
          Back to Login
        </Link>
      </motion.div>
    </div>
  );
}
