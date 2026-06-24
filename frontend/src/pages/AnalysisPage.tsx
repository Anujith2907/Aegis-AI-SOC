import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, GitBranch, AlertTriangle, Shield, Zap,
  Activity, Search, ChevronRight, Target, FileText, BarChart2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell } from 'recharts';
import { useThreatStore } from '../store';
import { mockShapFeatures, mockSimilarIncidents, mockDetectionResult, mockClusters } from '../data/mockData';
import type { ShapFeature, SimilarIncident, ThreatCluster } from '../types';

// ── Decision tree path visualization ─────────────────────────────────────────
const DECISION_PATH = [
  { node: 'Root', condition: 'packet_rate > 1000 pps', result: true, depth: 0 },
  { node: 'Node 2', condition: 'protocol == UDP', result: true, depth: 1 },
  { node: 'Node 5', condition: 'payload_size < 128 bytes', result: true, depth: 2 },
  { node: 'Node 11', condition: 'duration > 120s', result: true, depth: 3 },
  { node: 'Leaf', condition: 'PREDICTION: DDoS (94.7%)', result: true, depth: 4 },
];

const ATTACK_CHAIN = [
  { phase: 'Reconnaissance', desc: 'Target port scanning from 192.168.1.105', status: 'completed', time: '08:08:12' },
  { phase: 'Weaponization', desc: 'UDP flood payload assembled with 64-byte packets', status: 'completed', time: '08:09:30' },
  { phase: 'Delivery', desc: 'Volumetric attack initiated at 52,847 pps', status: 'completed', time: '08:10:23' },
  { phase: 'Exploitation', desc: 'Web Server 01 resources exhausted (CPU 98%)', status: 'completed', time: '08:11:15' },
  { phase: 'Impact', desc: 'Service disruption — 8,000 users affected', status: 'active', time: '08:11:30' },
  { phase: 'Containment', desc: 'AI Core triggered BGP blackhole routing', status: 'pending', time: '08:12:00' },
];

const CLUSTER_COLORS: Record<string, string> = {
  ddos: '#3b82f6',
  malware: '#f97316',
  'brute-force': '#a855f7',
  'port-scan': '#06b6d4',
  insider: '#ef4444',
};

const RADAR_FEATURES = [
  { metric: 'Packet Rate', value: 95 },
  { metric: 'Duration', value: 72 },
  { metric: 'Payload Size', value: 88 },
  { metric: 'Protocol', value: 65 },
  { metric: 'Source IPs', value: 40 },
  { metric: 'Bandwidth', value: 91 },
];

// ── SHAP waterfall bar chart data ────────────────────────────────────────────
function shapToChart(features: ShapFeature[]) {
  return features.map((f) => ({
    name: f.feature.replace(/_/g, ' '),
    impact: Number(f.impact.toFixed(3)),
    fill: f.impact > 0 ? '#3b82f6' : '#10b981',
  }));
}

export function AnalysisPage() {
  const { detectionResult } = useThreatStore();
  const [activeTab, setActiveTab] = useState<'shap' | 'tree' | 'chain' | 'clusters'>('shap');
  const [animateIn, setAnimateIn] = useState(false);

  const features = detectionResult?.rootCause?.shapFeatures || mockShapFeatures;
  const similar  = detectionResult?.similarIncidents || mockSimilarIncidents;
  const result   = detectionResult || mockDetectionResult;

  useEffect(() => { setAnimateIn(true); }, []);

  const chartData = shapToChart(features);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-orbitron text-xl font-bold neon-text-blue flex items-center gap-2">
            <Brain size={22} /> Root Cause Analysis
          </h2>
          <p className="text-slate-500 text-sm font-mono-cyber mt-1">
            SHAP explainability • Decision paths • Kill-chain mapping
          </p>
        </div>
        <div className="flex items-center gap-2 glass-card px-4 py-2 rounded">
          <Target size={14} className="text-neon-blue" />
          <span className="font-mono-cyber text-xs text-neon-blue">
            Incident: {result.threatType} — {result.confidence}% confidence
          </span>
        </div>
      </div>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
            <AlertTriangle size={24} className="text-neon-blue" />
          </div>
          <div className="flex-1">
            <h3 className="font-orbitron text-lg font-bold text-slate-200 mb-2">Investigation Summary</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {result.rootCause?.summary ||
                "The model identified this as a DDoS attack primarily due to the extreme packet rate (52,847 pps), high bandwidth consumption (8.2 MB/s), and minimal payload size consistent with UDP flood patterns. The sustained duration and concentrated destination ports further confirm volumetric attack behavior."}
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              {[
                { label: 'Threat Type', value: result.threatType, color: '#3b82f6' },
                { label: 'Risk Score', value: `${result.riskScore}/100`, color: '#ef4444' },
                { label: 'Severity', value: result.severity.toUpperCase(), color: '#f97316' },
                { label: 'Source', value: result.sourceIP, color: '#06b6d4' },
              ].map((item) => (
                <div key={item.label} className="px-3 py-1.5 rounded text-xs font-mono-cyber"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}33`, color: item.color }}>
                  {item.label}: <span className="font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-800/60 pb-1">
        {[
          { id: 'shap', label: 'SHAP Explainability', icon: BarChart2 },
          { id: 'tree', label: 'Decision Path', icon: GitBranch },
          { id: 'chain', label: 'Kill Chain', icon: Zap },
          { id: 'clusters', label: 'Threat Clusters', icon: Activity },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all rounded-t ${
              activeTab === id
                ? 'text-neon-blue border-b-2 border-current'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            style={{ fontFamily: "'Exo 2', sans-serif" }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">

        {/* ── SHAP Tab ──────────────────────────────────────────────────── */}
        {activeTab === 'shap' && (
          <motion.div key="shap" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* SHAP feature bars */}
            <div className="xl:col-span-2 glass-card rounded-xl p-5">
              <h4 className="font-orbitron text-base font-bold text-slate-300 uppercase tracking-wider mb-1">
                Feature Contributions
              </h4>
              <p className="text-xs text-slate-500 font-mono-cyber mb-5">
                SHAP values — positive pushes toward threat, negative pushes toward safe
              </p>

              <div className="space-y-4 mb-6">
                {features.map((f, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-mono-cyber text-slate-300">{f.feature}</span>
                      <span className="text-xs font-mono-cyber" style={{ color: f.impact > 0 ? '#3b82f6' : '#10b981' }}>
                        {f.impact > 0 ? '+' : ''}{f.impact.toFixed(3)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-7 rounded relative overflow-hidden"
                        style={{ background: 'rgba(5,2,8,0.6)', border: '1px solid rgba(59,130,246,0.1)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(0.01, Math.min(1.0, Math.abs(f.impact))) * 100}%` }}
                          transition={{ duration: 0.8, delay: i * 0.08 }}
                          className="absolute top-0 h-full rounded"
                          style={{
                            background: f.impact > 0
                              ? 'linear-gradient(90deg, rgba(59,130,246,0.7), rgba(96,165,250,0.5))'
                              : 'linear-gradient(90deg, rgba(16,185,129,0.7), rgba(52,211,153,0.5))',
                            left: f.impact > 0 ? '50%' : undefined,
                            right: f.impact <= 0 ? '50%' : undefined,
                          }}
                        />
                        <div className="absolute inset-y-0 left-1/2 w-px bg-slate-700" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{f.description}</p>
                  </motion.div>
                ))}
              </div>

              {/* SHAP bar chart */}
              <h5 className="font-orbitron text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Waterfall Summary</h5>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.06)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={100} />
                  <Tooltip contentStyle={{ background: 'rgba(5,5,20,0.96)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 6 }} />
                  <Bar dataKey="impact" radius={[0, 3, 3, 0]}>
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar + similar incidents */}
            <div className="space-y-6">
              <div className="glass-card rounded-xl p-5">
                <h4 className="font-orbitron text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Feature Radar</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={RADAR_FEATURES}>
                    <PolarGrid stroke="rgba(59,130,246,0.12)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#6b7280', fontSize: 9 }} />
                    <PolarRadiusAxis tick={false} axisLine={false} />
                    <Radar name="Threat" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card rounded-xl p-5">
                <h4 className="font-orbitron text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Similar Incidents (KNN)</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {similar.slice(0, 4).map((inc, i) => (
                    <motion.div key={inc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-3 rounded-lg transition-all hover:border-blue-500/30"
                      style={{ background: 'rgba(5,2,8,0.7)', border: '1px solid rgba(59,130,246,0.12)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-slate-300 truncate flex-1">{inc.title}</p>
                        <span className="font-orbitron text-sm font-bold text-neon-blue ml-2">{inc.similarity}%</span>
                      </div>
                      <div className="flex gap-3 text-xs text-slate-500 font-mono-cyber">
                        <span>{inc.recoveryDuration}</span>
                        <span>•</span>
                        <span className="text-green-400">{inc.successRate}% success</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Decision Path Tab ─────────────────────────────────────────── */}
        {activeTab === 'tree' && (
          <motion.div key="tree" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-card rounded-xl p-6">
            <h4 className="font-orbitron text-base font-bold text-slate-300 uppercase tracking-wider mb-1">
              XGBoost Decision Path
            </h4>
            <p className="text-xs text-slate-500 font-mono-cyber mb-6">
              How the ensemble classifier arrived at its prediction
            </p>
            <div className="space-y-0">
              {DECISION_PATH.map((node, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}>
                  <div className="flex items-start gap-4" style={{ paddingLeft: `${node.depth * 32}px` }}>
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        i === DECISION_PATH.length - 1
                          ? 'bg-blue-500/20 border-blue-500'
                          : node.result ? 'bg-green-500/10 border-green-500/40' : 'bg-red-500/10 border-red-500/40'
                      } border`}>
                        {i === DECISION_PATH.length - 1 ? (
                          <Target size={18} className="text-blue-400" />
                        ) : (
                          <GitBranch size={16} className={node.result ? 'text-green-400' : 'text-red-400'} />
                        )}
                      </div>
                      {i < DECISION_PATH.length - 1 && (
                        <div className="w-0.5 h-6 bg-slate-700/50 mt-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-orbitron text-xs font-bold text-slate-400">{node.node}</span>
                        {node.result && i < DECISION_PATH.length - 1 && (
                          <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/30 font-mono-cyber">TRUE</span>
                        )}
                      </div>
                      <p className="text-sm font-mono-cyber text-slate-300">{node.condition}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <h5 className="font-orbitron text-xs font-bold text-neon-blue uppercase tracking-wider mb-2">Model Details</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono-cyber">
                {[
                  { label: 'Model', value: 'XGBoost + RF' },
                  { label: 'Trees', value: '150 estimators' },
                  { label: 'Max Depth', value: '8 levels' },
                  { label: 'Accuracy', value: '97.3%' },
                ].map((m) => (
                  <div key={m.label}>
                    <span className="text-slate-500">{m.label}</span>
                    <div className="text-slate-300 font-bold mt-0.5">{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Kill Chain Tab ────────────────────────────────────────────── */}
        {activeTab === 'chain' && (
          <motion.div key="chain" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-card rounded-xl p-6">
            <h4 className="font-orbitron text-base font-bold text-slate-300 uppercase tracking-wider mb-1">
              Cyber Kill Chain (Lockheed Martin)
            </h4>
            <p className="text-xs text-slate-500 font-mono-cyber mb-6">
              Attack lifecycle mapping from reconnaissance to containment
            </p>
            <div className="space-y-0">
              {ATTACK_CHAIN.map((step, i) => {
                const statusColor = step.status === 'completed' ? '#10b981'
                  : step.status === 'active' ? '#ef4444' : '#6366f1';
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.12 }}
                    className="flex items-start gap-4">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center border"
                        style={{
                          background: `${statusColor}15`,
                          borderColor: `${statusColor}55`,
                          boxShadow: step.status === 'active' ? `0 0 16px ${statusColor}33` : 'none',
                        }}>
                        <span className="font-orbitron text-xs font-bold" style={{ color: statusColor }}>{i + 1}</span>
                      </div>
                      {i < ATTACK_CHAIN.length - 1 && (
                        <div className="w-0.5 flex-1 mt-1 min-h-[20px]"
                          style={{ background: `linear-gradient(180deg, ${statusColor}33, rgba(59,130,246,0.1))` }} />
                      )}
                    </div>
                    <div className="pb-5 flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-orbitron text-sm font-bold text-slate-200">{step.phase}</span>
                        <span className="text-xs px-2 py-0.5 rounded font-mono-cyber"
                          style={{
                            background: `${statusColor}18`,
                            color: statusColor,
                            border: `1px solid ${statusColor}33`,
                          }}>
                          {step.status}
                        </span>
                        <span className="text-xs font-mono-cyber text-slate-600 ml-auto">{step.time}</span>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Threat Clusters Tab ───────────────────────────────────────── */}
        {activeTab === 'clusters' && (
          <motion.div key="clusters" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-card rounded-xl p-6">
            <h4 className="font-orbitron text-base font-bold text-slate-300 uppercase tracking-wider mb-1">
              Threat Clustering (KMeans PCA)
            </h4>
            <p className="text-xs text-slate-500 font-mono-cyber mb-6">
              Unsupervised clustering of historical incidents — 2D PCA projection
            </p>

            {/* Scatter-like visualization with positioned dots */}
            <div className="relative w-full h-72 rounded-lg overflow-hidden"
              style={{ background: 'rgba(5,2,8,0.6)', border: '1px solid rgba(59,130,246,0.1)' }}>
              {/* Axes */}
              <div className="absolute bottom-4 left-4 right-4 h-px bg-slate-800" />
              <div className="absolute top-4 bottom-4 left-8 w-px bg-slate-800" />
              <span className="absolute bottom-0 left-1/2 text-xs text-slate-600 font-mono-cyber">PCA-1</span>
              <span className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-slate-600 font-mono-cyber">PCA-2</span>

              {mockClusters.map((c, i) => {
                const px = ((c.x + 7) / 14) * 100;
                const py = ((c.y + 5) / 10) * 100;
                const color = CLUSTER_COLORS[c.group] || '#6366f1';
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.7, scale: 1 }}
                    transition={{ delay: i * 0.01 }}
                    className="absolute rounded-full"
                    style={{
                      left: `${Math.min(95, Math.max(5, px))}%`,
                      top: `${Math.min(95, Math.max(5, 100 - py))}%`,
                      width: `${c.size}px`,
                      height: `${c.size}px`,
                      background: color,
                      boxShadow: `0 0 ${c.size}px ${color}55`,
                    }}
                    title={`${c.label} (x:${c.x.toFixed(1)}, y:${c.y.toFixed(1)})`}
                  />
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4">
              {Object.entries(CLUSTER_COLORS).map(([group, color]) => (
                <div key={group} className="flex items-center gap-2 text-xs font-mono-cyber">
                  <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                  <span className="text-slate-400 capitalize">{group.replace('-', ' ')}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
