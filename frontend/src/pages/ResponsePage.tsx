import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Mail, Ticket, Bell, CheckCircle, Loader2, AlertTriangle, Play } from 'lucide-react';
import type { ResponseAction } from '../types';

const RESPONSE_ACTIONS: ResponseAction[] = [
  { id: '1', type: 'block_ip', status: 'pending', description: 'Block attacker IP (192.168.1.105) across all edge nodes and firewalls' },
  { id: '2', type: 'send_alert', status: 'pending', description: 'Send critical alert email to security team (5 recipients)' },
  { id: '3', type: 'create_ticket', status: 'pending', description: 'Auto-create high-priority incident ticket in JIRA/ServiceNow' },
  { id: '4', type: 'notify_admin', status: 'pending', description: 'Push notification to all admin accounts + Slack/Teams alert' },
  { id: '5', type: 'isolate_system', status: 'pending', description: 'Network isolate affected web-server-01 from production VLAN' },
];

const ACTION_ICONS: Record<string, any> = {
  block_ip: Shield,
  send_alert: Mail,
  create_ticket: Ticket,
  notify_admin: Bell,
  isolate_system: AlertTriangle,
};

const ACTION_COLORS: Record<string, string> = {
  block_ip: '#ff2244',
  send_alert: '#ff8800',
  create_ticket: '#8b5cf6',
  notify_admin: '#ffcc00',
  isolate_system: '#00d4ff',
};

function WorkflowStep({ action, index, total }: { action: ResponseAction; index: number; total: number }) {
  const Icon = ACTION_ICONS[action.type];
  const color = ACTION_COLORS[action.type];

  return (
    <div className="workflow-step flex-1">
      <div className={`workflow-step-circle ${action.status === 'completed' ? 'active' : action.status === 'running' ? 'pending' : ''}`}
        style={action.status === 'completed' ? { borderColor: color, background: `${color}18`, boxShadow: `0 0 20px ${color}44` } : {}}>
        {action.status === 'completed'
          ? <CheckCircle size={22} style={{ color }} />
          : action.status === 'running'
          ? <Loader2 size={22} style={{ color }} className="animate-spin" />
          : <Icon size={22} style={{ color: 'rgba(148,163,184,0.4)' }} />
        }
      </div>

      {index < total - 1 && (
        <motion.div
          className="absolute top-8 h-0.5"
          style={{
            left: '50%',
            width: '100%',
            background: action.status === 'completed'
              ? `linear-gradient(90deg, ${color}, ${ACTION_COLORS[RESPONSE_ACTIONS[index + 1]?.type || 'block_ip']})`
              : 'rgba(0,212,255,0.1)',
            zIndex: -1,
          }}
          initial={{ scaleX: 0, transformOrigin: 'left' }}
          animate={{ scaleX: action.status === 'completed' ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </div>
  );
}

export function ResponsePage() {
  const [actions, setActions] = useState<ResponseAction[]>(RESPONSE_ACTIONS);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [log, setLog] = useState<string[]>([]);

  const triggerResponse = async () => {
    setIsRunning(true);
    setActions(RESPONSE_ACTIONS.map((a) => ({ ...a, status: 'pending' })));
    setLog([]);
    setCurrentStep(0);

    const logMessages = [
      '[08:12:45] 🔴 CRITICAL THREAT DETECTED — Initiating autonomous response protocol...',
      '[08:12:46] 🛡️ Blacklisting IP 192.168.1.105 on firewall-01, firewall-02, edge-gw-01...',
      '[08:12:48] ✅ IP blocked on 3 firewalls, 2 routers, 1 CDN edge node',
      '[08:12:49] 📧 Sending critical alert emails to security-team@company.com...',
      '[08:12:51] ✅ Emails sent to 5 recipients: John D., Alice M., Bob K., Eve L., Charlie S.',
      '[08:12:52] 🎫 Creating JIRA ticket SEC-2847 "Critical DDoS Attack - Web Server Cluster"...',
      '[08:12:54] ✅ Ticket created: SEC-2847, Priority P0, Assigned to SecOps Team',
      '[08:12:55] 🔔 Pushing admin notifications via Slack #security-alerts, Teams...',
      '[08:12:57] ✅ 8 admin accounts notified via push + Slack/Teams alerts sent',
      '[08:12:58] 🔒 Initiating network isolation for web-server-01 from VLAN-prod...',
      '[08:13:01] ✅ web-server-01 isolated. Failover to web-server-02 completed.',
      '[08:13:02] 🎯 AUTONOMOUS RESPONSE COMPLETE — Threat contained in 17 seconds',
    ];

    for (let i = 0; i < actions.length; i++) {
      setCurrentStep(i);
      setActions((prev) => prev.map((a, idx) => ({ ...a, status: idx === i ? 'running' : idx < i ? 'completed' : 'pending' })));

      const msgIdx = i * 2;
      if (logMessages[msgIdx]) setLog((l) => [...l, logMessages[msgIdx]]);
      await new Promise((r) => setTimeout(r, 1200));
      if (logMessages[msgIdx + 1]) setLog((l) => [...l, logMessages[msgIdx + 1]]);

      setActions((prev) => prev.map((a, idx) => ({
        ...a,
        status: idx <= i ? 'completed' : 'pending',
        timestamp: idx === i ? new Date().toISOString() : a.timestamp,
      })));
      await new Promise((r) => setTimeout(r, 300));
    }

    setLog((l) => [...l, logMessages[logMessages.length - 1]]);
    setCurrentStep(-1);
    setIsRunning(false);
  };

  const resetAll = () => {
    setActions(RESPONSE_ACTIONS.map((a) => ({ ...a, status: 'pending' })));
    setLog([]);
    setCurrentStep(-1);
  };

  const allComplete = actions.every((a) => a.status === 'completed');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-orbitron text-xl font-bold neon-text-blue">Autonomous Response Center</h2>
          <p className="text-slate-500 text-sm font-mono-cyber mt-1">
            AI-driven incident response automation for critical threats
          </p>
        </div>
        {allComplete && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 rounded"
            style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)' }}>
            <CheckCircle size={16} className="text-cyber-green" />
            <span className="text-cyber-green font-rajdhani font-bold text-sm">THREAT CONTAINED</span>
          </motion.div>
        )}
      </div>

      {/* Incident Alert Banner */}
      <div className="glass-card-red rounded-lg p-4 flex items-start gap-4">
        <AlertTriangle size={24} className="text-threat-red flex-shrink-0 mt-0.5 animate-pulse" />
        <div>
          <h3 className="font-rajdhani font-bold text-threat-red uppercase tracking-wider">
            CRITICAL INCIDENT ACTIVE — INC-2847
          </h3>
          <p className="text-slate-300 text-sm mt-1">
            DDoS Attack detected from 192.168.1.105 — 94.7% confidence — Risk Score: 94/100
          </p>
          <p className="text-slate-500 text-xs font-mono-cyber mt-1">
            Detected: 2026-06-23 08:12:23 UTC • Duration: 17s • Packets/sec: 52,847
          </p>
        </div>
      </div>

      {/* Workflow visualization */}
      <div className="glass-card rounded-lg p-6">
        <h3 className="font-rajdhani font-bold text-base text-slate-300 uppercase tracking-wider mb-6">
          Response Workflow
        </h3>
        <div className="flex items-start justify-between gap-2 mb-8 relative">
          {actions.map((action, i) => {
            const Icon = ACTION_ICONS[action.type];
            const color = ACTION_COLORS[action.type];
            return (
              <div key={action.id} className="flex-1 flex flex-col items-center gap-2 relative">
                {/* Connector line */}
                {i < actions.length - 1 && (
                  <div className="absolute top-8 left-1/2 w-full h-0.5"
                    style={{
                      background: action.status === 'completed'
                        ? `linear-gradient(90deg, ${color}80, ${ACTION_COLORS[actions[i + 1]?.type]}40)`
                        : 'rgba(0,212,255,0.08)',
                    }} />
                )}
                {/* Circle */}
                <div className="w-16 h-16 rounded-full flex items-center justify-center z-10 relative transition-all duration-500"
                  style={{
                    background: action.status === 'completed' ? `${color}18` : action.status === 'running' ? `${color}08` : 'rgba(4,10,26,0.8)',
                    border: `2px solid ${action.status !== 'pending' ? color : 'rgba(0,212,255,0.15)'}`,
                    boxShadow: action.status !== 'pending' ? `0 0 20px ${color}44` : 'none',
                  }}>
                  {action.status === 'completed'
                    ? <CheckCircle size={22} style={{ color }} />
                    : action.status === 'running'
                    ? <Loader2 size={22} style={{ color }} className="animate-spin" />
                    : <Icon size={22} style={{ color: 'rgba(148,163,184,0.3)' }} />
                  }
                </div>
                {/* Label */}
                <span className="text-xs text-center font-mono-cyber leading-tight"
                  style={{ color: action.status !== 'pending' ? color : 'rgba(148,163,184,0.4)', maxWidth: 80 }}>
                  {action.type.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action details */}
        <div className="space-y-3">
          {actions.map((action, i) => {
            const Icon = ACTION_ICONS[action.type];
            const color = ACTION_COLORS[action.type];
            return (
              <div key={action.id} className="flex items-center gap-4 p-4 rounded transition-all"
                style={{
                  background: action.status === 'completed' ? `${color}08` : 'rgba(4,10,26,0.5)',
                  border: `1px solid ${action.status !== 'pending' ? `${color}33` : 'rgba(0,212,255,0.08)'}`,
                }}>
                <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
                  {action.status === 'running'
                    ? <Loader2 size={16} style={{ color }} className="animate-spin" />
                    : action.status === 'completed'
                    ? <CheckCircle size={16} style={{ color }} />
                    : <Icon size={16} style={{ color: 'rgba(148,163,184,0.4)' }} />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-200">{action.description}</p>
                  {action.timestamp && (
                    <p className="text-xs text-slate-500 font-mono-cyber mt-0.5">
                      Completed: {new Date(action.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
                <span className="text-xs font-mono-cyber px-2 py-1 rounded"
                  style={{
                    background: `${action.status === 'completed' ? color : action.status === 'running' ? '#ff8800' : '#374151'}18`,
                    color: action.status === 'completed' ? color : action.status === 'running' ? '#ff8800' : '#6b7280',
                    border: `1px solid ${action.status === 'completed' ? `${color}44` : 'transparent'}`,
                  }}>
                  {action.status.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Control buttons */}
        <div className="flex gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={triggerResponse}
            disabled={isRunning}
            className="btn-threat rounded flex items-center gap-2 px-6 py-3 disabled:opacity-50"
          >
            {isRunning
              ? <><Loader2 size={16} className="animate-spin" /> Running Response...</>
              : <><Play size={16} /> Trigger Autonomous Response</>
            }
          </motion.button>
          <button onClick={resetAll} disabled={isRunning}
            className="btn-cyber rounded px-4 py-3 text-sm disabled:opacity-40">
            Reset
          </button>
        </div>
      </div>

      {/* Response Log */}
      <AnimatePresence>
        {log.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="glass-card rounded-lg p-5">
            <h3 className="font-rajdhani font-bold text-sm text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap size={14} className="text-neon-blue" />
              Response Execution Log
            </h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {log.map((entry, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="font-mono-cyber text-xs"
                  style={{
                    color: entry.includes('✅') ? '#00ff88' : entry.includes('🔴') || entry.includes('COMPLETE') ? '#ff8800' : '#94a3b8',
                  }}>
                  {entry}
                </motion.div>
              ))}
              {isRunning && (
                <div className="flex items-center gap-2 font-mono-cyber text-xs text-neon-blue">
                  <span className="animate-pulse">█</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
