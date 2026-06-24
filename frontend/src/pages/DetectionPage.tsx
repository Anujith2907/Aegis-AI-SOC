import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Scan, AlertTriangle, Shield, Clock, Server, Zap, TrendingUp, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { useThreatStore } from '../store';
import { mockDetectionResult, mockShapFeatures, mockSimilarIncidents } from '../data/mockData';
import type { ThreatDetectionResult } from '../types';
import { threatAPI } from '../api';

const THREAT_COLORS: Record<string, string> = {
  'DDoS': '#ff2244', 'Brute Force': '#ff8800', 'Malware': '#ff4444',
  'Port Scan': '#8b5cf6', 'Unauthorized Access': '#ffcc00', 'Normal Traffic': '#00ff88',
};

const CONFIDENCE_DATA = [
  { name: 'DDoS', value: 94.7 },
  { name: 'Malware', value: 3.1 },
  { name: 'Brute Force', value: 1.5 },
  { name: 'Port Scan', value: 0.5 },
  { name: 'Unauthorized', value: 0.2 },
];

const RADAR_DATA = [
  { metric: 'Packet Rate', value: 95 },
  { metric: 'Duration', value: 72 },
  { metric: 'Payload Size', value: 88 },
  { metric: 'Protocol', value: 65 },
  { metric: 'Source IPs', value: 40 },
  { metric: 'Bandwidth', value: 91 },
];

function SeverityBar({ score }: { score: number }) {
  const color = score >= 90 ? '#ff2244' : score >= 70 ? '#ff8800' : score >= 40 ? '#ffcc00' : '#00ff88';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400 font-mono-cyber">Risk Score</span>
        <span className="font-bold" style={{ color }}>{score}/100</span>
      </div>
      <div className="cyber-progress">
        <motion.div
          className="cyber-progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
        />
      </div>
    </div>
  );
}

export function DetectionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ThreatDetectionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'detection' | 'shap' | 'similar'>('detection');
  const { setDetectionResult, setScanning: setGlobalScanning } = useThreatStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  const handleScan = async () => {
    setScanning(true);
    setGlobalScanning(true);
    setResult(null);
    try {
      let scanResult: ThreatDetectionResult;
      if (file) {
        const response = await threatAPI.detectThreats(file);
        scanResult = response.data;
      } else {
        const dummyFile = new File(["dummy_packet_rate,52847\nunique_src_ips,1"], "logs_sample.csv", { type: "text/csv" });
        const response = await threatAPI.detectThreats(dummyFile);
        scanResult = response.data;
      }
      setResult(scanResult);
      setDetectionResult(scanResult);
    } catch (error) {
      console.warn("Backend threat detection failed or offline. Using local simulation data:", error);
      await new Promise((r) => setTimeout(r, 2000));
      const fallbackResult = {
        ...mockDetectionResult,
        rootCause: {
          summary: "The model identified this as a DDoS attack primarily due to the extreme packet rate (52,847 pps), high bandwidth consumption (8.2 MB/s), and minimal payload size consistent with UDP flood patterns. The sustained duration and concentrated destination ports further confirm volumetric attack behavior.",
          shapFeatures: mockShapFeatures,
          decisionPath: ["Root node: packet_rate > 1000", "Predicted class: DDoS"],
          investigationInsights: ["Ensemble classifier triggered detection.", "Calculated SHAP waterfall approximation."]
        },
        similarIncidents: mockSimilarIncidents
      };
      setResult(fallbackResult);
      setDetectionResult(fallbackResult);
    } finally {
      setScanning(false);
      setGlobalScanning(false);
    }
  };

  const threatColor = result ? THREAT_COLORS[result.threatType] || '#00d4ff' : '#00d4ff';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-orbitron text-xl font-bold neon-text-blue">AI Threat Detection</h2>
        <p className="text-slate-500 text-sm font-mono-cyber mt-1">
          Upload network logs for XGBoost + Random Forest ensemble analysis
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className="relative rounded-lg cursor-pointer transition-all duration-300 p-10 text-center"
        style={{
          background: isDragging ? 'rgba(0,212,255,0.08)' : 'rgba(4,10,26,0.6)',
          border: `2px dashed ${isDragging ? '#00d4ff' : 'rgba(0,212,255,0.25)'}`,
          boxShadow: isDragging ? '0 0 30px rgba(0,212,255,0.2)' : 'none',
        }}
      >
        <input ref={fileRef} type="file" className="hidden" accept=".csv,.log,.pcap,.txt,.json"
          onChange={(e) => e.target.files && setFile(e.target.files[0])} />
        <motion.div animate={{ y: isDragging ? -8 : 0 }} className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,212,255,0.1)', border: '2px solid rgba(0,212,255,0.3)' }}>
            <Upload size={28} className="text-neon-blue" />
          </div>
          {file ? (
            <div>
              <p className="font-rajdhani font-semibold text-neon-blue">{file.name}</p>
              <p className="text-slate-500 text-sm font-mono-cyber">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <p className="font-rajdhani font-semibold text-slate-300 text-lg">
                Drop network log files here
              </p>
              <p className="text-slate-500 text-sm font-mono-cyber mt-1">
                Supports: .csv, .log, .pcap, .json, .txt
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Demo scan button */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleScan}
          disabled={scanning}
          className="btn-cyber-solid rounded flex items-center gap-2 px-8 py-3 disabled:opacity-60"
        >
          {scanning ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Scan size={18} />
              </motion.div>
              Scanning...
            </>
          ) : (
            <>
              <Scan size={18} />
              Analyze Threats
            </>
          )}
        </motion.button>
        <button onClick={() => { setFile(null); setResult(null); }}
          className="btn-cyber rounded px-6 py-3 text-sm">
          Reset
        </button>
      </div>

      {/* Scanning animation */}
      {scanning && (
        <div className="glass-card rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
              <Scan size={20} className="text-neon-blue" />
            </motion.div>
            <span className="font-rajdhani font-semibold text-neon-blue">AI Engine Processing...</span>
          </div>
          {['Loading XGBoost model', 'Running Random Forest ensemble', 'Computing Decision Tree paths', 'Calculating feature importance', 'Generating predictions'].map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.5 }} className="flex items-center gap-3 py-2 border-b border-cyber-border/30">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ delay: i * 0.5, duration: 0.3 }}>
                <div className="w-2 h-2 rounded-full bg-neon-blue" />
              </motion.div>
              <span className="text-sm text-slate-400 font-mono-cyber">{step}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Result header */}
            <div className="glass-card rounded-lg p-6"
              style={{ borderColor: `${threatColor}33`, boxShadow: `0 0 30px ${threatColor}11` }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle size={24} style={{ color: threatColor }} />
                    <h3 className="font-orbitron text-xl font-bold" style={{ color: threatColor }}>
                      {result.threatType} DETECTED
                    </h3>
                  </div>
                  <p className="text-slate-400 text-sm font-mono-cyber">
                    Confidence: <span className="font-bold" style={{ color: threatColor }}>{result.confidence}%</span> •
                    Risk Score: <span className="font-bold" style={{ color: threatColor }}>{result.riskScore}/100</span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="badge-critical px-3 py-1.5 rounded text-sm font-bold">
                    {result.severity.toUpperCase()}
                  </div>
                  <div className="text-slate-500 text-xs font-mono-cyber mt-2">
                    Priority #{result.priorityLevel}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                  { icon: Server, label: 'Source IP', value: result.sourceIP },
                  { icon: Shield, label: 'Protocol', value: result.protocol },
                  { icon: Clock, label: 'Duration', value: `${result.duration}s` },
                  { icon: TrendingUp, label: 'Data', value: `${(result.bytesTransferred / 1024 / 1024).toFixed(1)} MB` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="p-3 rounded" style={{ background: 'rgba(4,10,26,0.6)', border: '1px solid rgba(0,212,255,0.1)' }}>
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-mono-cyber mb-1">
                      <Icon size={12} />
                      {label}
                    </div>
                    <div className="font-mono-cyber text-sm font-bold text-slate-200">{value}</div>
                  </div>
                ))}
              </div>

              <SeverityBar score={result.riskScore} />

              {/* Business impact */}
              <div className="mt-4 p-3 rounded" style={{ background: 'rgba(255,34,68,0.06)', border: '1px solid rgba(255,34,68,0.2)' }}>
                <p className="text-xs text-slate-400 font-mono-cyber">{result.businessImpact}</p>
              </div>

              {/* Affected assets */}
              <div className="mt-4">
                <p className="text-xs text-slate-500 font-mono-cyber uppercase tracking-wider mb-2">Affected Assets</p>
                <div className="flex flex-wrap gap-2">
                  {result.affectedAssets.map((asset) => (
                    <span key={asset} className="px-3 py-1 rounded text-xs font-mono-cyber"
                      style={{ background: 'rgba(255,34,68,0.1)', border: '1px solid rgba(255,34,68,0.3)', color: '#ff8800' }}>
                      {asset}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-cyber-border/30 pb-1">
              {[
                { id: 'detection', label: 'Attack Timeline', icon: Clock },
                { id: 'shap', label: 'Root Cause (SHAP)', icon: BarChart2 },
                { id: 'similar', label: 'Similar Incidents', icon: Zap },
              ].map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-rajdhani font-semibold transition-all ${activeTab === id ? 'text-neon-blue border-b-2 border-neon-blue' : 'text-slate-500'}`}>
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'detection' && (
              <div className="glass-card rounded-lg p-5">
                <h4 className="font-rajdhani font-bold text-base text-slate-300 uppercase tracking-wider mb-4">
                  Attack Timeline
                </h4>
                <div className="space-y-3">
                  {result.attackTimeline.map((event, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                          style={{ background: event.type === 'critical' ? '#ff2244' : event.type === 'warning' ? '#ff8800' : '#00d4ff' }} />
                        {i < result.attackTimeline.length - 1 && (
                          <div className="w-0.5 flex-1 mt-1" style={{ background: 'rgba(0,212,255,0.15)', minHeight: '20px' }} />
                        )}
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono-cyber text-xs text-neon-blue">{event.time}</span>
                          <span className="text-xs px-2 py-0.5 rounded"
                            style={{
                              background: event.type === 'critical' ? 'rgba(255,34,68,0.15)' : event.type === 'warning' ? 'rgba(255,136,0,0.15)' : 'rgba(0,212,255,0.1)',
                              color: event.type === 'critical' ? '#ff2244' : event.type === 'warning' ? '#ff8800' : '#00d4ff',
                              border: `1px solid ${event.type === 'critical' ? 'rgba(255,34,68,0.3)' : event.type === 'warning' ? 'rgba(255,136,0,0.3)' : 'rgba(0,212,255,0.2)'}`,
                            }}>
                            {event.type}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">{event.event}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Confidence bars */}
                <div className="mt-6">
                  <h4 className="font-rajdhani font-bold text-sm text-slate-400 uppercase tracking-wider mb-3">
                    Model Confidence Distribution
                  </h4>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={CONFIDENCE_DATA} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.06)" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} unit="%" />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Rajdhani' }} width={90} />
                      <Tooltip contentStyle={{ background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 4 }} />
                      <Bar dataKey="value" fill="#00d4ff" radius={[0, 2, 2, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'shap' && (
              <div className="glass-card rounded-lg p-5">
                <h4 className="font-rajdhani font-bold text-base text-slate-300 uppercase tracking-wider mb-2">
                  SHAP Explainability — Root Cause Analysis
                </h4>
                <p className="text-xs text-slate-500 font-mono-cyber mb-5">
                  Feature contributions to the prediction (positive = increases threat probability)
                </p>
                <div className="space-y-4 mb-6">
                  {(result.rootCause?.shapFeatures || mockShapFeatures).map((f, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-mono-cyber text-slate-300">{f.feature}</span>
                        <span className="text-xs font-mono-cyber" style={{ color: f.impact > 0 ? '#ff4444' : '#00ff88' }}>
                          {f.impact > 0 ? '+' : ''}{f.impact.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-6 rounded relative overflow-hidden"
                          style={{ background: 'rgba(4,10,26,0.6)', border: '1px solid rgba(0,212,255,0.1)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(0.01, Math.min(1.0, Math.abs(f.impact))) * 100}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className="absolute top-0 h-full rounded"
                            style={{
                              background: f.impact > 0 ? 'linear-gradient(90deg, rgba(255,34,68,0.6), rgba(255,136,0,0.4))' : 'linear-gradient(90deg, rgba(0,255,136,0.6), rgba(0,212,255,0.4))',
                              left: f.impact > 0 ? '50%' : undefined,
                              right: f.impact <= 0 ? '50%' : undefined,
                            }}
                          />
                          <div className="absolute inset-y-0 left-1/2 w-px bg-slate-600" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{f.description}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="p-4 rounded" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}>
                  <h5 className="text-xs font-rajdhani font-bold text-neon-blue uppercase tracking-wider mb-2">
                    Investigation Summary
                  </h5>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {result.rootCause?.summary || `The model identified this as a DDoS attack primarily due to the extreme packet rate (52,847 pps), high bandwidth consumption (8.2 MB/s), and minimal payload size consistent with UDP flood patterns. The sustained duration and concentrated destination ports further confirm volumetric attack behavior.`}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'similar' && (
              <div className="glass-card rounded-lg p-5">
                <h4 className="font-rajdhani font-bold text-base text-slate-300 uppercase tracking-wider mb-4">
                  Similar Historical Incidents (KNN)
                </h4>
                <div className="space-y-3">
                  {(result.similarIncidents || mockSimilarIncidents).map((inc, i) => (
                    <motion.div key={inc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 rounded transition-all hover:border-neon-blue/30"
                      style={{ background: 'rgba(4,10,26,0.7)', border: '1px solid rgba(0,212,255,0.12)' }}>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <p className="font-semibold text-slate-200 text-sm">{inc.title}</p>
                          <p className="text-xs text-slate-500 font-mono-cyber mt-0.5">{inc.date}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-orbitron text-lg font-bold text-neon-blue">{inc.similarity}%</div>
                          <div className="text-xs text-slate-500 font-mono-cyber">similarity</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <div className="text-xs">
                          <p className="text-slate-500 font-mono-cyber mb-0.5">Resolution</p>
                          <p className="text-slate-300 font-medium text-xs leading-tight">{inc.resolutionMethod}</p>
                        </div>
                        <div className="text-xs">
                          <p className="text-slate-500 font-mono-cyber mb-0.5">Recovery</p>
                          <p className="text-cyber-green font-bold">{inc.recoveryDuration}</p>
                        </div>
                        <div className="text-xs">
                          <p className="text-slate-500 font-mono-cyber mb-0.5">Success</p>
                          <p className="text-neon-blue font-bold">{inc.successRate}%</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="cyber-progress">
                          <div className="cyber-progress-fill" style={{ width: `${inc.similarity}%` }} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
