import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell, Legend } from 'recharts';
import { mockAttackTrends } from '../data/mockData';

const SEVERITY_DATA = [
  { name: 'Jan', critical: 8, high: 15, medium: 22, low: 30 },
  { name: 'Feb', critical: 12, high: 18, medium: 25, low: 28 },
  { name: 'Mar', critical: 6, high: 20, medium: 30, low: 35 },
  { name: 'Apr', critical: 15, high: 25, medium: 20, low: 25 },
  { name: 'May', critical: 10, high: 22, medium: 28, low: 32 },
  { name: 'Jun', critical: 18, high: 28, medium: 32, low: 22 },
];

const HEALTH_DATA = [
  { metric: 'Firewall', value: 92 },
  { metric: 'IDS/IPS', value: 88 },
  { metric: 'Endpoint', value: 75 },
  { metric: 'Network', value: 95 },
  { metric: 'Data', value: 82 },
  { metric: 'Identity', value: 78 },
];

const SOURCE_DATA = [
  { region: 'North America', attacks: 145, color: '#00d4ff' },
  { region: 'Eastern Europe', attacks: 212, color: '#ff2244' },
  { region: 'East Asia', attacks: 178, color: '#ff8800' },
  { region: 'South Asia', attacks: 96, color: '#8b5cf6' },
  { region: 'Western Europe', attacks: 67, color: '#00ff88' },
  { region: 'Other', attacks: 48, color: '#ffcc00' },
];

const MONTHLY_DATA = [
  { month: 'Jan', resolved: 89, open: 11, avg_time: 4.2 },
  { month: 'Feb', resolved: 95, open: 8, avg_time: 3.8 },
  { month: 'Mar', resolved: 76, open: 15, avg_time: 5.1 },
  { month: 'Apr', resolved: 102, open: 9, avg_time: 3.5 },
  { month: 'May', resolved: 88, open: 12, avg_time: 4.0 },
  { month: 'Jun', resolved: 115, open: 18, avg_time: 2.9 },
];

const TOOLTIP_STYLE = {
  contentStyle: { background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: 4, fontSize: 12 },
  labelStyle: { color: '#00d4ff', fontFamily: 'Rajdhani', fontWeight: 600 },
};

export function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="font-orbitron text-xl font-bold neon-text-blue">Analytics Center</h2>
        <p className="text-slate-500 text-sm font-mono-cyber mt-1">
          Interactive security metrics and threat intelligence visualizations
        </p>
      </div>

      {/* Attack trends + Severity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Attack trends */}
        <div className="glass-card rounded-lg p-5">
          <h3 className="font-rajdhani font-bold text-base neon-text-blue uppercase tracking-wider mb-4">
            Attack Trends — 6 Months
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={mockAttackTrends}>
              <defs>
                {[
                  { id: 'ddos', color: '#ff2244' },
                  { id: 'malware', color: '#ff8800' },
                  { id: 'brute', color: '#8b5cf6' },
                  { id: 'port', color: '#00d4ff' },
                  { id: 'unauth', color: '#00ff88' },
                ].map(({ id, color }) => (
                  <linearGradient key={id} id={`g_${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Rajdhani' }} />
              <Area type="monotone" dataKey="ddos" stroke="#ff2244" fill="url(#g_ddos)" strokeWidth={2} name="DDoS" />
              <Area type="monotone" dataKey="malware" stroke="#ff8800" fill="url(#g_malware)" strokeWidth={2} name="Malware" />
              <Area type="monotone" dataKey="bruteForce" stroke="#8b5cf6" fill="url(#g_brute)" strokeWidth={2} name="Brute Force" />
              <Area type="monotone" dataKey="portScan" stroke="#00d4ff" fill="url(#g_port)" strokeWidth={1.5} name="Port Scan" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Severity distribution */}
        <div className="glass-card rounded-lg p-5">
          <h3 className="font-rajdhani font-bold text-base neon-text-blue uppercase tracking-wider mb-4">
            Severity Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={SEVERITY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Rajdhani' }} />
              <Bar dataKey="critical" stackId="a" fill="#ff2244" name="Critical" radius={[0, 0, 0, 0]} />
              <Bar dataKey="high" stackId="a" fill="#ff8800" name="High" />
              <Bar dataKey="medium" stackId="a" fill="#ffcc00" name="Medium" />
              <Bar dataKey="low" stackId="a" fill="#00ff88" name="Low" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Security Health + Sources */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Security health radar */}
        <div className="glass-card rounded-lg p-5">
          <h3 className="font-rajdhani font-bold text-base neon-text-blue uppercase tracking-wider mb-4">
            Security Health Metrics
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={HEALTH_DATA}>
              <PolarGrid stroke="rgba(0,212,255,0.12)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Rajdhani' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
              <Radar name="Health Score" dataKey="value" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {HEALTH_DATA.map((d) => (
              <div key={d.metric} className="text-center">
                <div className="font-orbitron text-sm font-bold"
                  style={{ color: d.value >= 90 ? '#00ff88' : d.value >= 75 ? '#ffcc00' : '#ff8800' }}>
                  {d.value}%
                </div>
                <div className="text-xs text-slate-500 font-mono-cyber">{d.metric}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Threat sources */}
        <div className="glass-card rounded-lg p-5">
          <h3 className="font-rajdhani font-bold text-base neon-text-blue uppercase tracking-wider mb-4">
            Attack Sources by Region
          </h3>
          <div className="flex gap-4 items-center">
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie data={SOURCE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="attacks">
                  {SOURCE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} opacity={0.85} />)}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {SOURCE_DATA.map((d) => (
                <div key={d.region} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-slate-400 font-mono-cyber text-xs">{d.region}</span>
                  </div>
                  <span className="font-semibold font-mono-cyber" style={{ color: d.color }}>{d.attacks}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly report */}
      <div className="glass-card rounded-lg p-5">
        <h3 className="font-rajdhani font-bold text-base neon-text-blue uppercase tracking-wider mb-4">
          Monthly Incident Report
        </h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Total Resolved', value: '565', color: '#00ff88' },
            { label: 'Still Open', value: '73', color: '#ff8800' },
            { label: 'Avg Resolution', value: '3.9h', color: '#00d4ff' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center p-3 rounded"
              style={{ background: `${color}08`, border: `1px solid ${color}22` }}>
              <div className="font-orbitron text-2xl font-bold" style={{ color }}>{value}</div>
              <div className="text-xs text-slate-500 font-mono-cyber mt-1">{label}</div>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={MONTHLY_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.06)" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Rajdhani' }} />
            <Bar dataKey="resolved" fill="#00ff88" name="Resolved" radius={[2, 2, 0, 0]} opacity={0.8} />
            <Bar dataKey="open" fill="#ff2244" name="Open" radius={[2, 2, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
