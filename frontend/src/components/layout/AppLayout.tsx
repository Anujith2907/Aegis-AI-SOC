import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Radar, Brain,
  MessageSquare, Zap, FileText, BarChart3, Settings,
  ChevronLeft, ChevronRight, LogOut, User, Bell
} from 'lucide-react';
import { useAuthStore, useAppStore } from '../../store';
import { SceneBackground } from '../3d/SceneBackground';

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/detection', icon: Radar, label: 'Threat Detection' },
  { path: '/analysis', icon: Brain, label: 'Root Cause Analysis' },
  { path: '/copilot', icon: MessageSquare, label: 'AI Copilot' },
  { path: '/response', icon: Zap, label: 'Auto Response' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/admin', icon: Settings, label: 'Admin Panel' },
];

// ── Animated SVG Logo ────────────────────────────────────────────────────────
function AegisLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer rotating ring */}
      <circle cx="24" cy="24" r="21" stroke="url(#ring)" strokeWidth="1.5" fill="none" opacity="0.6">
        <animateTransform attributeName="transform" type="rotate" values="0 24 24;360 24 24" dur="12s" repeatCount="indefinite" />
      </circle>
      {/* Inner reverse ring */}
      <circle cx="24" cy="24" r="16" stroke="url(#ring2)" strokeWidth="1" strokeDasharray="6 4" fill="none" opacity="0.4">
        <animateTransform attributeName="transform" type="rotate" values="360 24 24;0 24 24" dur="8s" repeatCount="indefinite" />
      </circle>
      {/* Shield shape */}
      <path d="M24 6 L38 14 L38 26 C38 34 31 40 24 43 C17 40 10 34 10 26 L10 14 Z"
        fill="url(#shieldFill)" stroke="url(#shieldStroke)" strokeWidth="1.5" opacity="0.9">
        <animate attributeName="opacity" values="0.85;1;0.85" dur="3s" repeatCount="indefinite" />
      </path>
      {/* AI circuit node in center */}
      <circle cx="24" cy="24" r="4" fill="#dbeafe">
        <animate attributeName="r" values="3.5;4.5;3.5" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="24" cy="24" r="2" fill="#3b82f6">
        <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite" />
      </circle>
      {/* Circuit lines from center */}
      <line x1="24" y1="20" x2="24" y2="13" stroke="#60a5fa" strokeWidth="1" opacity="0.5">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
      </line>
      <line x1="28" y1="24" x2="34" y2="24" stroke="#60a5fa" strokeWidth="1" opacity="0.5">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.5s" repeatCount="indefinite" />
      </line>
      <line x1="20" y1="24" x2="14" y2="24" stroke="#60a5fa" strokeWidth="1" opacity="0.5">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.8s" repeatCount="indefinite" />
      </line>
      <line x1="24" y1="28" x2="24" y2="35" stroke="#60a5fa" strokeWidth="1" opacity="0.5">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.2s" repeatCount="indefinite" />
      </line>
      {/* Pulse dot on outer ring */}
      <circle cx="24" cy="3" r="1.5" fill="#3b82f6">
        <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="rotate" values="0 24 24;360 24 24" dur="6s" repeatCount="indefinite" />
      </circle>
      {/* Gradient defs */}
      <defs>
        <linearGradient id="ring" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="ring2" x1="0" y1="48" x2="48" y2="0">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="shieldFill" x1="10" y1="6" x2="38" y2="43">
          <stop offset="0%" stopColor="rgba(59,130,246,0.25)" />
          <stop offset="100%" stopColor="rgba(99,102,241,0.15)" />
        </linearGradient>
        <linearGradient id="shieldStroke" x1="10" y1="6" x2="38" y2="43">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const navigate = useNavigate();
  const [notifications] = useState(5);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden cyber-grid-bg">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative flex flex-col h-full overflow-hidden"
        style={{
          background: 'rgba(2, 6, 23, 0.96)',
          borderRight: '1px solid rgba(59, 130, 246, 0.12)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.5)',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 h-16 border-b border-slate-800/50">
          <div className="flex-shrink-0">
            <AegisLogo size={sidebarOpen ? 36 : 32} />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                <div className="font-display text-base font-extrabold tracking-wider leading-none"
                  style={{
                    background: 'linear-gradient(90deg, #60a5fa, #818cf8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                  AEGIS
                </div>
                <div className="font-display text-[10px] font-semibold text-slate-500 tracking-[0.3em] mt-0.5">AI SOC</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon size={18} className="flex-shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-rajdhani text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#020617' }}>
              {user?.name?.charAt(0) || 'S'}
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Security Admin'}</div>
                  <div className="text-xs text-slate-500 truncate">{user?.role || 'admin'}</div>
                </motion.div>
              )}
            </AnimatePresence>
            {sidebarOpen && (
              <button onClick={handleLogout} className="text-slate-500 hover:text-threat-red transition-colors">
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          className="absolute top-1/2 -right-3 w-6 h-6 rounded-full flex items-center justify-center z-50 transition-all hover:scale-110"
          style={{ background: '#0f172a', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6' }}
        >
          {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* 3D Background — sits behind all page content */}
        <SceneBackground />

        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-6 flex-shrink-0 relative z-10"
          style={{ background: 'rgba(2,6,23,0.88)', borderBottom: '1px solid rgba(59,130,246,0.08)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
              <span className="font-mono-cyber text-xs text-cyber-green">SYSTEM SECURE</span>
            </div>
            <div className="font-mono-cyber text-xs text-slate-600">
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}{' '}
              <span className="text-slate-400">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card">
              <span className="font-display text-xs font-bold tracking-wider"
                style={{
                  background: 'linear-gradient(90deg, #60a5fa, #818cf8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>AEGISAI</span>
              <span className="font-display text-xs text-slate-500">SOC v2.1</span>
            </div>
            <button className="relative text-slate-400 hover:text-neon-blue transition-colors">
              <Bell size={18} />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: '#ef4444', color: '#fff', fontSize: '9px' }}>
                  {notifications}
                </span>
              )}
            </button>
            <NavLink to="/profile" className="text-slate-400 hover:text-neon-blue transition-colors">
              <User size={18} />
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto relative z-10">
          {children}
        </main>
      </div>

      {/* Scan line overlay */}
      <div className="scan-overlay" />
    </div>
  );
}
