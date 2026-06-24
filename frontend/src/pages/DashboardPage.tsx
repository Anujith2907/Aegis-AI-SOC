import { useEffect, useState, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import {
  Shield, AlertTriangle, Activity, Lock, TrendingUp,
  Wifi, Server, Clock, Eye, Zap, Globe,
  Radio, Cpu, BarChart3
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { useThreatStore, useAppStore } from '../store';
import { mockIncidents, mockAttackTrends, mockThreatIntel } from '../data/mockData';
import { QuantumVortex } from '../components/3d/QuantumVortex';
import { FloatingParticles } from '../components/3d/BackgroundElements';
import type { Incident } from '../types';

// ───── Animated Counter ──────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / 50;
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 25);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString()}{suffix}</span>;
}

// ───── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({
  title, value, suffix = '', icon: Icon, color, change, subtitle, pulse = false
}: {
  title: string; value: number; suffix?: string; icon: any; color: string;
  change?: number; subtitle?: string; pulse?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: `0 0 40px ${color}22` }}
      className="glass-card rounded-xl p-5 relative overflow-hidden cursor-default"
      style={{ borderColor: `${color}22` }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 blur-2xl pointer-events-none"
        style={{ background: color, transform: 'translate(40%, -40%)' }} />
      <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full opacity-3 blur-xl pointer-events-none"
        style={{ background: color, transform: 'translate(-40%, 40%)' }} />

      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 relative"
          style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
          <Icon size={20} style={{ color }} />
          {pulse && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full animate-ping"
              style={{ background: color, opacity: 0.8 }} />
          )}
        </div>
        {change !== undefined && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-xs font-mono-cyber px-2 py-0.5 rounded ${change >= 0 ? 'text-red-400' : 'text-green-400'}`}
            style={{
              background: change >= 0 ? 'rgba(255,34,68,0.1)' : 'rgba(0,255,136,0.1)',
              border: `1px solid ${change >= 0 ? 'rgba(255,34,68,0.25)' : 'rgba(0,255,136,0.25)'}`,
            }}
          >
            {change >= 0 ? '+' : ''}{change}%
          </motion.span>
        )}
      </div>

      <div className="font-orbitron text-2xl font-bold mb-1" style={{ color }}>
        <AnimatedCounter value={value} suffix={suffix} />
      </div>
      <div className="font-rajdhani text-sm font-semibold text-slate-300 mb-0.5">{title}</div>
      {subtitle && <div className="text-xs text-slate-600 font-mono-cyber">{subtitle}</div>}
    </motion.div>
  );
}

// ───── Severity / Status Badges ───────────────────────────────────────────────
function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded ${map[severity] || 'badge-normal'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {severity.toUpperCase()}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: '#ff2244', investigating: '#ff8800', contained: '#00d4ff', resolved: '#00ff88',
  };
  const color = colors[status] || '#94a3b8';
  return (
    <span className="text-xs font-mono-cyber px-2 py-0.5 rounded"
      style={{ background: `${color}18`, color, border: `1px solid ${color}33` }}>
      {status}
    </span>
  );
}

// ───── Chart data ─────────────────────────────────────────────────────────────
const PIE_DATA = [
  { name: 'DDoS',         value: 28, color: '#e11d48' },
  { name: 'Malware',      value: 22, color: '#f97316' },
  { name: 'Brute Force',  value: 18, color: '#f59e0b' },
  { name: 'Port Scan',    value: 20, color: '#6366f1' },
  { name: 'Unauthorized', value: 12, color: '#10b981' },
];

const RADAR_DATA = [
  { metric: 'DDoS',       value: 88 },
  { metric: 'Malware',    value: 65 },
  { metric: 'Phishing',   value: 45 },
  { metric: 'Ransomware', value: 72 },
  { metric: 'Insider',    value: 30 },
  { metric: 'Zero-Day',   value: 55 },
];

const LIVE_FEED = [
  { region: 'East Asia', attacks: 847, trend: +14 },
  { region: 'Eastern Europe', attacks: 623, trend: +8 },
  { region: 'South America', attacks: 412, trend: -3 },
  { region: 'Middle East', attacks: 389, trend: +21 },
  { region: 'North Africa', attacks: 277, trend: +5 },
];

// ───── Globe Scene ────────────────────────────────────────────────────────────
function VortexScene({ attackActive }: { attackActive: boolean }) {
  return (
    <Canvas camera={{ position: [0, 0.5, 3.8], fov: 52 }} gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }} dpr={[1, 1.5]}>
      <Suspense fallback={null}>
        <Stars radius={100} depth={50} count={1500} factor={2} saturation={0} fade speed={0.2} />
        <FloatingParticles count={80} attackActive={attackActive} />
        <QuantumVortex attackActive={attackActive} />
        <OrbitControls enablePan={false} enableZoom={false} autoRotate={false} />
      </Suspense>
    </Canvas>
  );
}

// ───── Threat Meter ───────────────────────────────────────────────────────────
function ThreatMeter({ score }: { score: number }) {
  const color = score >= 80 ? '#ef4444' : score >= 60 ? '#f59e0b' : score >= 40 ? '#eab308' : '#10b981';
  const label = score >= 80 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 40 ? 'ELEVATED' : 'NORMAL';
  const angle = (score / 100) * 180 - 90;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16 overflow-hidden">
        {/* Gauge background arcs */}
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(59,130,246,0.1)" strokeWidth="8" strokeLinecap="round" />
          <motion.path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="125.6"
            initial={{ strokeDashoffset: 125.6 }}
            animate={{ strokeDashoffset: 125.6 - (score / 100) * 125.6 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
          {/* Needle */}
          <motion.line
            x1="50" y1="50"
            x2="50" y2="15"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ rotate: -90, originX: '50px', originY: '50px' }}
            animate={{ rotate: angle, originX: '50px', originY: '50px' }}
            transition={{ duration: 1.5, ease: 'easeOut', type: 'spring' }}
            style={{ transformOrigin: '50px 50px' }}
          />
          <circle cx="50" cy="50" r="3" fill={color} />
        </svg>
      </div>
      <div className="font-orbitron text-xl font-bold mt-1" style={{ color }}>{score}</div>
      <div className="text-xs font-mono-cyber mt-0.5" style={{ color }}>{label} THREAT</div>
    </div>
  );
}

// ───── Live Geo Attack Row ────────────────────────────────────────────────────
function GeoAttackRow({ region, attacks, trend, delay }: { region: string; attacks: number; trend: number; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3 py-2.5 border-b border-slate-800/50 last:border-0"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Globe size={12} className="text-slate-500 flex-shrink-0" />
        <span className="text-sm text-slate-300 font-rajdhani font-medium truncate">{region}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-20 h-1.5 rounded-full overflow-hidden bg-slate-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(attacks / 900) * 100}%` }}
            transition={{ duration: 1, delay }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }}
          />
        </div>
        <span className="font-mono-cyber text-xs text-slate-400 w-10 text-right">{attacks}</span>
        <span className={`text-xs font-mono-cyber w-12 text-right ${trend > 0 ? 'text-red-400' : 'text-green-400'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      </div>
    </motion.div>
  );
}

// ───── Main Dashboard ─────────────────────────────────────────────────────────
export function DashboardPage() {
  const { stats } = useThreatStore();
  const { attackSimulationActive, setAttackSimulation } = useAppStore();
  const [liveIncidents, setLiveIncidents] = useState<Incident[]>(mockIncidents.slice(0, 6));
  const [threatScore, setThreatScore] = useState(72);
  const [tick, setTick] = useState(0);
  const tickRef = useRef(0);

  // Live incident stream + threat score fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current++;
      setTick(tickRef.current);

      // Fluctuate threat score
      setThreatScore(prev => {
        const delta = (Math.random() - 0.48) * 3;
        const next = Math.max(10, Math.min(99, prev + delta));
        return Math.round(next);
      });

      // Inject new incident every 5 ticks
      if (tickRef.current % 5 === 0) {
        const types = ['DDoS', 'Brute Force', 'Port Scan', 'Malware'] as const;
        const severities = ['low', 'medium', 'high', 'critical'] as const;
        const t = types[Math.floor(Math.random() * types.length)];
        const s = severities[Math.floor(Math.random() * severities.length)];
        const newInc: Incident = {
          id: `live-${Date.now()}`,
          title: `Live: ${t} detected`,
          threatType: t,
          severity: s,
          status: 'open',
          timestamp: new Date().toISOString(),
          sourceIP: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          affectedSystems: Math.floor(Math.random() * 5) + 1,
          riskScore: Math.floor(Math.random() * 100),
        };
        setLiveIncidents(prev => [newInc, ...prev.slice(0, 7)]);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">

      {/* ── Hero Banner with 3D Globe ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(2,6,23,0.97) 0%, rgba(15,23,42,0.95) 100%)',
          border: '1px solid rgba(59,130,246,0.15)',
          boxShadow: '0 0 60px rgba(59,130,246,0.06), 0 25px 50px rgba(0,0,0,0.6)',
          minHeight: '280px',
        }}
      >
        {/* Scan line */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.6), transparent)' }} />

        {/* Corner decorations */}
        <div className="absolute top-3 left-3 w-5 h-5" style={{ borderTop: '2px solid #3b82f6', borderLeft: '2px solid #3b82f6' }} />
        <div className="absolute top-3 right-3 w-5 h-5" style={{ borderTop: '2px solid #6366f1', borderRight: '2px solid #6366f1' }} />
        <div className="absolute bottom-3 left-3 w-5 h-5" style={{ borderBottom: '2px solid #3b82f6', borderLeft: '2px solid #3b82f6' }} />
        <div className="absolute bottom-3 right-3 w-5 h-5" style={{ borderBottom: '2px solid #6366f1', borderRight: '2px solid #6366f1' }} />

        <div className="flex flex-col lg:flex-row items-center gap-0">
          {/* Left: text content */}
          <div className="flex-1 p-8 z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
              <span className="font-mono-cyber text-xs text-cyber-green tracking-widest uppercase">System Online • All Sensors Active</span>
            </div>
            <h1 className="font-orbitron text-3xl lg:text-4xl font-black neon-text-blue leading-tight mb-2">
              SECURITY OPERATIONS
              <br />
              <span className="text-slate-300">COMMAND CENTER</span>
            </h1>
            <p className="text-slate-500 font-mono-cyber text-sm mb-6 max-w-md">
              Real-time AI-powered threat intelligence across 147 monitored network nodes
            </p>

            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setAttackSimulation(!attackSimulationActive)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-rajdhani font-bold text-sm transition-all ${
                  attackSimulationActive
                    ? 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30'
                    : 'btn-cyber-solid rounded-lg'
                }`}
              >
                <Radio size={15} className={attackSimulationActive ? 'animate-pulse' : ''} />
                {attackSimulationActive ? 'Stop Simulation' : 'Simulate Attack'}
              </motion.button>

              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg glass-card text-sm font-mono-cyber text-slate-400">
                <Cpu size={14} className="text-neon-blue" />
                AI Engine v4.2.1
              </div>
            </div>

            {/* Mini stats row */}
            <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-slate-800/60">
              {[
                { label: 'Nodes Monitored', value: '147', color: '#3b82f6' },
                { label: 'Rules Active', value: '2,841', color: '#6366f1' },
                { label: 'Uptime', value: '99.97%', color: '#10b981' },
                { label: 'Response Time', value: '< 1.2s', color: '#06b6d4' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-orbitron text-base font-bold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs font-mono-cyber text-slate-600 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Quantum Vortex */}
          <div className="w-full lg:w-72 xl:w-80 h-64 lg:h-72 flex-shrink-0 relative">
            <VortexScene attackActive={attackSimulationActive} />
            {/* Vortex label overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none">
              <div className="font-mono-cyber text-xs text-slate-500">
                {attackSimulationActive ? (
                  <span className="animate-pulse" style={{ color: '#ef4444' }}>⚠ QUANTUM BREACH — CORE DESTABILISED</span>
                ) : (
                  <span style={{ color: '#3b82f6' }}>Quantum Threat Core — Live</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard title="Total Incidents" value={stats.totalIncidents + Math.floor(tick / 5)} icon={Activity} color="#3b82f6" change={12} subtitle="All time" />
        <StatCard title="Active Threats" value={stats.activeThreats} icon={AlertTriangle} color="#ef4444" change={3} subtitle="Right now" pulse />
        <StatCard title="Security Score" value={stats.securityScore} suffix="%" icon={Shield} color="#10b981" change={-2} subtitle="Overall health" />
        <StatCard title="Critical Alerts" value={stats.criticalAlerts} icon={Eye} color="#f59e0b" subtitle="Need attention" pulse={attackSimulationActive} />
        <StatCard title="Blocked Attacks" value={stats.blockedAttacks + Math.floor(tick / 2)} icon={Lock} color="#6366f1" subtitle="This month" />
        <StatCard title="Resolved Today" value={stats.resolvedToday} icon={TrendingUp} color="#06b6d4" subtitle="Last 24h" />
      </div>

      {/* ── Middle Row: Charts + Threat Meter ──────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* Attack trend chart — spans 2 cols */}
        <div className="xl:col-span-2 glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-rajdhani text-base font-bold neon-text-blue uppercase tracking-wider flex items-center gap-2">
              <BarChart3 size={16} />
              Attack Trend Analysis
            </h3>
            <span className="text-xs font-mono-cyber text-slate-500">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockAttackTrends}>
              <defs>
                <linearGradient id="ddosGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="malwareGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bruteGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.07)" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Space Grotesk' }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.96)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8 }} labelStyle={{ color: '#3b82f6', fontFamily: 'Exo 2', fontWeight: 700 }} itemStyle={{ color: '#f1f5f9', fontSize: 12 }} />
              <Area type="monotone" dataKey="ddos" stroke="#ef4444" fill="url(#ddosGrad)" strokeWidth={2} name="DDoS" />
              <Area type="monotone" dataKey="malware" stroke="#f97316" fill="url(#malwareGrad)" strokeWidth={2} name="Malware" />
              <Area type="monotone" dataKey="bruteForce" stroke="#6366f1" fill="url(#bruteGrad)" strokeWidth={2} name="Brute Force" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Threat Meter + Radar */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-rajdhani text-base font-bold neon-text-blue uppercase tracking-wider mb-4 flex items-center gap-2">
            <Zap size={16} />
            Threat Level
          </h3>
          <div className="flex justify-center mb-4">
            <ThreatMeter score={threatScore} />
          </div>
          <div className="space-y-2 mt-4">
            {[
              { label: 'Network', val: 85, color: '#ef4444' },
              { label: 'Endpoint', val: 62, color: '#f59e0b' },
              { label: 'Cloud', val: 44, color: '#06b6d4' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-mono-cyber text-slate-500">{item.label}</span>
                  <span className="font-bold" style={{ color: item.color }}>{item.val}%</span>
                </div>
                <div className="cyber-progress">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.val}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="cyber-progress-fill"
                    style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}88)` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Radar chart */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-rajdhani text-base font-bold neon-text-blue uppercase tracking-wider mb-2 flex items-center gap-2">
            <Radio size={16} />
            Threat Radar
          </h3>
          <p className="text-xs text-slate-600 font-mono-cyber mb-2">Attack vector coverage</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="rgba(59,130,246,0.12)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'Space Grotesk' }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar name="Threat" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.14} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bottom Row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Live incident stream */}
        <div className="xl:col-span-1 glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-rajdhani text-base font-bold neon-text-blue uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live Incident Stream
            </h3>
            <span className="text-xs font-mono-cyber text-slate-500">Auto-refresh</span>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {liveIncidents.map((inc) => (
                <motion.div
                  key={inc.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`incident-card rounded-lg ${inc.severity}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{inc.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500 font-mono-cyber">{inc.sourceIP}</span>
                        <Server size={10} className="text-slate-600" />
                        <span className="text-xs text-slate-600">{inc.affectedSystems}s</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <SeverityBadge severity={inc.severity} />
                      <StatusBadge status={inc.status} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-slate-600 font-mono-cyber">
                    <Clock size={10} />
                    {new Date(inc.timestamp).toLocaleTimeString()}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Threat distribution pie */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-rajdhani text-base font-bold neon-text-blue uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity size={16} />
            Threat Distribution
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={48} outerRadius={70} paddingAngle={4} dataKey="value">
                {PIE_DATA.map((entry, index) => (
                  <Cell key={index} fill={entry.color} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
            {PIE_DATA.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-slate-400 font-mono-cyber truncate">{d.name}</span>
                <span className="font-semibold ml-auto" style={{ color: d.color }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Geo attack origin */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-rajdhani text-base font-bold neon-text-blue uppercase tracking-wider flex items-center gap-2">
              <Globe size={16} />
              Attack Origins
            </h3>
            <span className="text-xs font-mono-cyber text-slate-500">By region</span>
          </div>
          <div>
            {LIVE_FEED.map((item, i) => (
              <GeoAttackRow key={item.region} {...item} delay={i * 0.1} />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/50">
            <h4 className="font-rajdhani text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Threat Intel Feed</h4>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {mockThreatIntel.slice(0, 3).map((item) => (
                <div key={item.id} className="p-2.5 rounded-lg"
                  style={{ background: 'rgba(2,6,23,0.6)', border: '1px solid rgba(59,130,246,0.08)' }}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-neon-blue font-mono-cyber">{item.source}</span>
                    <SeverityBadge severity={item.severity} />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
