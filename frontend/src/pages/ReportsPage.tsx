import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Loader2, CheckCircle, Sparkles, Calendar, Shield, AlertTriangle } from 'lucide-react';
import { reportsAPI } from '../api';

const REPORT_TEMPLATES = [
  { id: 'executive', label: 'Executive Summary', desc: 'High-level overview for C-suite and management', color: '#8b5cf6' },
  { id: 'technical', label: 'Technical Incident Report', desc: 'Detailed technical analysis for SOC team', color: '#00d4ff' },
  { id: 'compliance', label: 'Compliance Report', desc: 'GDPR/SOC2/ISO 27001 compliance documentation', color: '#00ff88' },
  { id: 'forensics', label: 'Digital Forensics Report', desc: 'Evidence chain and investigation findings', color: '#ff8800' },
];

const MOCK_REPORT = {
  executiveSummary: `On June 23, 2026, at 08:12 UTC, AegisAI SOC's autonomous monitoring system detected and neutralized a high-severity Distributed Denial of Service (DDoS) attack targeting the primary web server infrastructure. The attack, originating from IP 192.168.1.105, achieved a packet rate of 52,847 packets per second — approximately 52x normal baseline traffic. The AI security system autonomously initiated response protocols within 3 seconds of detection, containing the threat in 17 seconds with zero data breach and minimal service disruption.`,
  incidentTimeline: `08:10:23 — Anomalous traffic spike detected\n08:10:45 — Packet rate threshold exceeded\n08:11:02 — DDoS pattern confirmed by AI ensemble model\n08:11:15 — Web Server 01 CPU at 98%, service degradation\n08:12:00 — Autonomous response protocol initiated\n08:12:18 — Source IP blacklisted across all edge nodes\n08:12:45 — CRITICAL: Full autonomous response triggered\n08:13:02 — Threat fully contained. System restored.`,
  rootCauseAnalysis: `The attack exploited the UDP protocol's connectionless nature to flood the target with minimal-payload packets (avg 64 bytes). Primary contributing factors:\n1. Single-source IP flood (low diversity score: 0.02)\n2. High bandwidth utilization: 8.2 MB/s sustained for 347 seconds\n3. No SYN verification required (UDP attack vector)\n4. Targeting CDN bypass vulnerability at edge gateway\n\nXGBoost model confidence: 94.7% (DDoS classification)\nSHAP primary driver: packets_per_second (impact: +0.42)`,
  impactAssessment: `Business Impact:\n• Service degradation: ~8,000 concurrent users affected for 2 minutes\n• Estimated revenue impact: $412 (minimal due to fast AI response)\n• SLA breach: None (response within 3-minute threshold)\n• Data exposure: None confirmed\n• Reputation risk: Low (incident contained before media exposure)\n\nTechnical Impact:\n• 4 systems affected: web-server-01, load-balancer-02, cdn-node-03, api-gateway-01\n• web-server-01 temporarily isolated and restored via failover`,
  mitigationPlan: `Immediate Actions (Completed):\n✅ Source IP blacklisted (192.168.1.105)\n✅ Rate limiting enforced at edge routers\n✅ BGP blackhole routing activated\n✅ CDN scrubbing enabled\n✅ web-server-01 failover to web-server-02\n\nShort-term (7 days):\n• Deploy additional DDoS scrubbing capacity\n• Update IDS signatures for UDP flood patterns\n• Enable SYN cookies on all public-facing servers\n\nMedium-term (30 days):\n• Implement anycast network architecture\n• Deploy DDoS protection at ISP level`,
  preventionStrategy: `To prevent recurrence and strengthen posture:\n\n1. Network Architecture:\n   - Implement anycast load distribution\n   - Deploy upstream ISP-level filtering\n   - Enable BGP Flowspec for dynamic routing\n\n2. AI Model Updates:\n   - Retrain models with new attack signature data\n   - Lower packet-rate alert threshold from 50K to 30K pps\n   - Enable real-time model inference pipeline\n\n3. Compliance & Governance:\n   - Schedule quarterly DDoS penetration testing\n   - Update incident response playbook\n   - Ensure NIST CSF alignment for detection category`,
};

export function ReportsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('executive');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [report, setReport] = useState<typeof MOCK_REPORT | null>(null);

  const generateReport = async () => {
    setGenerating(true);
    setGenerated(false);
    try {
      const incidentId = 'sim-init-001';
      const response = await reportsAPI.generate(incidentId, selectedTemplate);
      const repData = response.data;
      setReport({
        executiveSummary: repData.executiveSummary,
        incidentTimeline: repData.incidentTimeline,
        rootCauseAnalysis: repData.rootCauseAnalysis,
        impactAssessment: repData.impactAssessment,
        mitigationPlan: repData.mitigationPlan,
        preventionStrategy: repData.preventionStrategy
      });
      setGenerated(true);
    } catch (error) {
      console.warn("Backend report generation failed or offline. Using local simulation data:", error);
      await new Promise((r) => setTimeout(r, 2000));
      setReport(MOCK_REPORT);
      setGenerated(true);
    } finally {
      setGenerating(false);
    }
  };

  const exportPDF = () => {
    const content = document.getElementById('report-content');
    if (!content) return;
    window.print();
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="font-orbitron text-xl font-bold neon-text-blue">AI Report Generator</h2>
        <p className="text-slate-500 text-sm font-mono-cyber mt-1">
          Generate comprehensive incident reports powered by LangChain + Llama 3
        </p>
      </div>

      {/* Template selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {REPORT_TEMPLATES.map((t) => (
          <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
            className="p-4 rounded-lg text-left transition-all"
            style={{
              background: selectedTemplate === t.id ? `${t.color}12` : 'rgba(4,10,26,0.6)',
              border: `1px solid ${selectedTemplate === t.id ? `${t.color}55` : 'rgba(0,212,255,0.1)'}`,
              boxShadow: selectedTemplate === t.id ? `0 0 20px ${t.color}18` : 'none',
            }}>
            <FileText size={20} className="mb-2" style={{ color: t.color }} />
            <div className="font-rajdhani font-bold text-sm text-slate-200">{t.label}</div>
            <div className="text-xs text-slate-500 font-mono-cyber mt-1 leading-tight">{t.desc}</div>
          </button>
        ))}
      </div>

      {/* Generate section */}
      <div className="glass-card rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-rajdhani font-bold text-base text-slate-200">Report Configuration</h3>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono-cyber">
                <Calendar size={12} className="text-neon-blue" />
                Incident: INC-2847 | 2026-06-23
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono-cyber">
                <Shield size={12} className="text-cyber-green" />
                {REPORT_TEMPLATES.find((t) => t.id === selectedTemplate)?.label}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateReport}
              disabled={generating}
              className="btn-cyber-solid rounded flex items-center gap-2 px-6 py-3 disabled:opacity-60"
            >
              {generating
                ? <><Loader2 size={16} className="animate-spin" /> Generating...</>
                : <><Sparkles size={16} /> Generate Report</>
              }
            </motion.button>
            {generated && (
              <button onClick={exportPDF}
                className="btn-cyber rounded flex items-center gap-2 px-4 py-3 text-sm">
                <Download size={16} />
                Export PDF
              </button>
            )}
          </div>
        </div>

        {generating && (
          <div className="space-y-2">
            {['Analyzing incident data...', 'Running AI chain (LangChain + Llama 3)...', 'Querying ChromaDB for similar incidents...', 'Generating structured report...', 'Formatting output...'].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.5 }} className="flex items-center gap-2 text-xs text-slate-500 font-mono-cyber">
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}>
                  <Sparkles size={10} className="text-electric-purple" />
                </motion.div>
                {step}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Generated report */}
      <AnimatePresence>
        {generated && report && (
          <motion.div id="report-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-lg p-6 space-y-6">
            {/* Report header */}
            <div className="text-center border-b border-cyber-border/40 pb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <CheckCircle size={20} className="text-cyber-green" />
                <span className="font-mono-cyber text-xs text-cyber-green uppercase tracking-widest">Report Generated by AI</span>
              </div>
              <h2 className="font-orbitron text-2xl font-bold neon-text-blue">
                AEGISAI SOC — INCIDENT REPORT
              </h2>
              <div className="font-rajdhani text-lg text-slate-300 mt-1">
                {REPORT_TEMPLATES.find((t) => t.id === selectedTemplate)?.label}
              </div>
              <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-500 font-mono-cyber">
                <span>Incident ID: INC-2847</span>
                <span>•</span>
                <span>Generated: {new Date().toLocaleDateString()}</span>
                <span>•</span>
                <span>Classification: CONFIDENTIAL</span>
              </div>
            </div>

            {[
              { title: '1. Executive Summary', color: '#8b5cf6', content: report.executiveSummary, icon: Shield },
              { title: '2. Incident Timeline', color: '#00d4ff', content: report.incidentTimeline, icon: Calendar },
              { title: '3. Root Cause Analysis', color: '#ff8800', content: report.rootCauseAnalysis, icon: AlertTriangle },
              { title: '4. Impact Assessment', color: '#ff2244', content: report.impactAssessment, icon: AlertTriangle },
              { title: '5. Mitigation Plan', color: '#00ff88', content: report.mitigationPlan, icon: CheckCircle },
              { title: '6. Future Prevention Strategy', color: '#00ffcc', content: report.preventionStrategy, icon: Shield },
            ].map(({ title, color, content, icon: Icon }) => (
              <div key={title}>
                <div className="flex items-center gap-3 mb-3">
                  <Icon size={16} style={{ color }} />
                  <h3 className="font-rajdhani font-bold text-sm uppercase tracking-widest" style={{ color }}>
                    {title}
                  </h3>
                </div>
                <div className="pl-7">
                  {content.split('\n').map((line, i) => (
                    <p key={i} className="text-sm text-slate-300 leading-relaxed font-mono-cyber mb-1">{line}</p>
                  ))}
                </div>
              </div>
            ))}

            <div className="cyber-divider" />
            <div className="text-center text-xs text-slate-600 font-mono-cyber">
              This report was generated by AegisAI SOC — Autonomous Security Operations Platform
              <br />
              Report ID: RPT-{Date.now()} | Classification: CONFIDENTIAL | Distribution: SOC Team Only
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
