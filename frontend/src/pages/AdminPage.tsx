import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Activity, Settings, Trash2, Edit, Plus, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import type { User } from '../types';

const MOCK_USERS: User[] = [
  { id: '1', name: 'John Davidson', email: 'john.d@aegisai.soc', role: 'admin', createdAt: '2026-01-15T00:00:00Z' },
  { id: '2', name: 'Alice Martinez', email: 'alice.m@aegisai.soc', role: 'analyst', createdAt: '2026-02-20T00:00:00Z' },
  { id: '3', name: 'Bob Kim', email: 'bob.k@aegisai.soc', role: 'analyst', createdAt: '2026-03-10T00:00:00Z' },
  { id: '4', name: 'Eve Lee', email: 'eve.l@aegisai.soc', role: 'viewer', createdAt: '2026-04-05T00:00:00Z' },
  { id: '5', name: 'Charlie Smith', email: 'charlie.s@aegisai.soc', role: 'analyst', createdAt: '2026-05-18T00:00:00Z' },
];

const MODEL_METRICS = [
  { name: 'XGBoost (Threat Detector)', accuracy: 97.3, precision: 96.8, recall: 97.9, f1: 97.3, status: 'healthy' },
  { name: 'Random Forest', accuracy: 95.1, precision: 94.7, recall: 95.6, f1: 95.1, status: 'healthy' },
  { name: 'Decision Tree', accuracy: 91.2, precision: 90.8, recall: 91.7, f1: 91.2, status: 'warning' },
  { name: 'KNN (Similar Incidents)', accuracy: 88.5, precision: 88.1, recall: 89.0, f1: 88.5, status: 'healthy' },
  { name: 'K-Means (Clustering)', accuracy: null, precision: null, recall: null, f1: null, status: 'healthy' },
];

const SYSTEM_LOGS = [
  { time: '08:13:02', level: 'INFO', msg: 'Autonomous response completed for INC-2847' },
  { time: '08:12:45', level: 'CRITICAL', msg: 'DDoS attack detected — AI response triggered' },
  { time: '08:12:00', level: 'WARNING', msg: 'Network traffic anomaly threshold exceeded' },
  { time: '08:10:23', level: 'INFO', msg: 'Scheduled model retraining completed successfully' },
  { time: '07:00:00', level: 'INFO', msg: 'Daily threat intelligence feed updated (312 new IOCs)' },
  { time: '06:30:00', level: 'INFO', msg: 'ChromaDB vector store: 4,891 documents indexed' },
  { time: '05:15:00', level: 'WARNING', msg: 'Decision Tree model drift detected — retraining scheduled' },
  { time: '04:00:00', level: 'INFO', msg: 'System health check passed — all services operational' },
];

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'models' | 'logs'>('users');
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  const deleteUser = (id: string) => setUsers((u) => u.filter((u) => u.id !== id));

  const ROLE_COLORS: Record<string, string> = { admin: '#ff8800', analyst: '#00d4ff', viewer: '#8b5cf6' };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-orbitron text-xl font-bold neon-text-blue">Admin Panel</h2>
          <p className="text-slate-500 text-sm font-mono-cyber mt-1">
            System management, user control, and model monitoring
          </p>
        </div>
        <div className="flex items-center gap-2 glass-card px-3 py-2 rounded">
          <CheckCircle size={14} className="text-cyber-green" />
          <span className="text-xs font-mono-cyber text-cyber-green">ALL SYSTEMS NOMINAL</span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: '#00d4ff' },
          { label: 'Active Models', value: 5, icon: Activity, color: '#00ff88' },
          { label: 'System Uptime', value: '99.97%', icon: Shield, color: '#8b5cf6' },
          { label: 'Log Events', value: '24,891', icon: Settings, color: '#ff8800' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded flex items-center justify-center"
                style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div>
                <div className="font-orbitron text-lg font-bold" style={{ color }}>{value}</div>
                <div className="text-xs text-slate-500 font-mono-cyber">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-cyber-border/30 pb-1">
        {[
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'models', label: 'Model Monitoring', icon: Activity },
          { id: 'logs', label: 'System Logs', icon: Settings },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-rajdhani font-semibold transition-all ${activeTab === id ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-slate-500'}`}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Users tab */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-cyber-border/30">
            <h3 className="font-rajdhani font-bold text-sm text-slate-300 uppercase tracking-wider">
              User Accounts ({users.length})
            </h3>
            <button className="btn-cyber-solid rounded px-4 py-2 text-xs flex items-center gap-2">
              <Plus size={12} />
              Add User
            </button>
          </div>
          <table className="cyber-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: `${ROLE_COLORS[user.role]}22`, color: ROLE_COLORS[user.role], border: `1px solid ${ROLE_COLORS[user.role]}44` }}>
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-200">{user.name}</span>
                    </div>
                  </td>
                  <td className="font-mono-cyber text-xs text-slate-400">{user.email}</td>
                  <td>
                    <span className="px-2 py-0.5 rounded text-xs font-mono-cyber"
                      style={{ background: `${ROLE_COLORS[user.role]}18`, color: ROLE_COLORS[user.role], border: `1px solid ${ROLE_COLORS[user.role]}33` }}>
                      {user.role}
                    </span>
                  </td>
                  <td className="text-xs text-slate-500 font-mono-cyber">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="text-slate-500 hover:text-neon-blue transition-colors">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => deleteUser(user.id)}
                        className="text-slate-500 hover:text-threat-red transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Models tab */}
      {activeTab === 'models' && (
        <div className="space-y-3">
          {MODEL_METRICS.map((model) => (
            <div key={model.name} className="glass-card rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Activity size={16} className="text-neon-blue" />
                  <span className="font-rajdhani font-semibold text-slate-200">{model.name}</span>
                </div>
                <span className={`text-xs font-mono-cyber px-2 py-1 rounded flex items-center gap-1.5
                  ${model.status === 'healthy' ? 'text-cyber-green' : 'text-threat-orange'}`}
                  style={{
                    background: model.status === 'healthy' ? 'rgba(0,255,136,0.1)' : 'rgba(255,136,0,0.1)',
                    border: `1px solid ${model.status === 'healthy' ? 'rgba(0,255,136,0.3)' : 'rgba(255,136,0,0.3)'}`,
                  }}>
                  {model.status === 'healthy' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                  {model.status}
                </span>
              </div>
              {model.accuracy !== null && (
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Accuracy', value: model.accuracy, color: '#00d4ff' },
                    { label: 'Precision', value: model.precision, color: '#8b5cf6' },
                    { label: 'Recall', value: model.recall, color: '#00ff88' },
                    { label: 'F1 Score', value: model.f1, color: '#ff8800' },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="text-xs text-slate-500 font-mono-cyber mb-1">{label}</div>
                      <div className="font-orbitron text-base font-bold" style={{ color }}>{value}%</div>
                      <div className="cyber-progress mt-1">
                        <div className="cyber-progress-fill" style={{ width: `${value}%`, background: color }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {model.accuracy === null && (
                <p className="text-xs text-slate-500 font-mono-cyber">
                  Unsupervised model — Silhouette score: 0.73 | 5 clusters detected
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Logs tab */}
      {activeTab === 'logs' && (
        <div className="glass-card rounded-lg overflow-hidden">
          <div className="p-4 border-b border-cyber-border/30">
            <h3 className="font-rajdhani font-bold text-sm text-slate-300 uppercase tracking-wider">
              System Event Log — Today
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {SYSTEM_LOGS.map((log, i) => (
              <div key={i} className="flex items-start gap-4 px-4 py-3 border-b border-cyber-border/20 hover:bg-neon-blue/2 transition-colors">
                <span className="font-mono-cyber text-xs text-neon-blue flex-shrink-0">{log.time}</span>
                <span className={`text-xs font-mono-cyber px-1.5 py-0.5 rounded flex-shrink-0 ${
                  log.level === 'CRITICAL' ? 'bg-threat-red/20 text-threat-red' :
                  log.level === 'WARNING' ? 'bg-threat-orange/20 text-threat-orange' :
                  'bg-neon-blue/10 text-neon-blue'
                }`}>{log.level}</span>
                <span className="text-sm text-slate-400">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
