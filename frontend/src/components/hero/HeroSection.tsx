import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { SOCScene } from '../3d/SOCScene';
import { useAppStore, useThreatStore } from '../../store';

const ATTACK_STAGES = [
  { id: 'normal', label: 'SECURE', color: '#00ff88', icon: Shield, desc: 'All systems operational. Network traffic nominal.' },
  { id: 'attack', label: 'THREAT DETECTED', color: '#ff2244', icon: AlertTriangle, desc: 'Hostile activity detected. DDoS attack in progress.' },
  { id: 'analyzing', label: 'AI ANALYZING', color: '#ff8800', icon: Activity, desc: 'AI Core analyzing attack pattern & attack vectors.' },
  { id: 'blocked', label: 'THREAT BLOCKED', color: '#00d4ff', icon: CheckCircle, desc: 'Malicious node isolated. Incident report generated.' },
];

export function HeroSection() {
  const [stage, setStage] = useState(0);
  const [auto, setAuto] = useState(true);
  const { setAttackSimulation } = useAppStore();
  const { updateStats } = useThreatStore();

  const currentStage = ATTACK_STAGES[stage];
  const attackActive = stage === 1 || stage === 2;
  const shieldActive = stage === 2 || stage === 3;

  useEffect(() => {
    setAttackSimulation(attackActive);
  }, [attackActive]);

  useEffect(() => {
    if (!auto) return;
    const timer = setInterval(() => {
      setStage((s) => {
        const next = (s + 1) % ATTACK_STAGES.length;
        if (next === 1) updateStats({ activeThreats: 24, criticalAlerts: 6 });
        if (next === 3) updateStats({ activeThreats: 22, blockedAttacks: 3892 });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [auto]);

  const triggerAttack = () => {
    setAuto(false);
    setStage(1);
    setTimeout(() => setStage(2), 2000);
    setTimeout(() => { setStage(3); setTimeout(() => { setStage(0); setAuto(true); }, 3000); }, 4000);
  };

  return (
    <section className="relative min-h-screen cyber-grid-bg overflow-hidden flex flex-col">
      {/* Scan line overlay */}
      <div className="scan-overlay" />

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center justify-start pt-16 px-4">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded mb-4 glass-card border border-neon-blue/30">
            <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
            <span className="font-mono-cyber text-xs text-neon-blue tracking-widest uppercase">AegisAI Security Operations Center v2.0</span>
          </div>
          <h1 className="font-orbitron text-4xl md:text-6xl font-black mb-2 leading-tight">
            <span className="neon-text-blue">AEGIS</span>
            <span className="text-white">AI</span>
            <span className="neon-text-purple"> SOC</span>
          </h1>
          <p className="text-slate-400 font-rajdhani text-lg md:text-xl max-w-2xl mx-auto">
            Autonomous Network Incident Investigation & Response System
          </p>
        </motion.div>

        {/* Status banner */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 px-6 py-3 rounded glass-card mb-4"
            style={{ borderColor: `${currentStage.color}44`, boxShadow: `0 0 20px ${currentStage.color}22` }}
          >
            <currentStage.icon size={18} style={{ color: currentStage.color }} />
            <div>
              <div className="font-orbitron text-sm font-bold" style={{ color: currentStage.color }}>
                {currentStage.label}
              </div>
              <div className="text-slate-400 text-xs font-mono-cyber">{currentStage.desc}</div>
            </div>
            {stage === 2 && (
              <div className="flex gap-1 ml-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-4 rounded-full bg-orange-400"
                    animate={{ scaleY: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3D SOC Viewport */}
      <div className="relative flex-1 min-h-[500px]">
        <div className="absolute inset-0">
          <SOCScene attackActive={attackActive} shieldActive={shieldActive} />
        </div>

        {/* Stage indicators */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {ATTACK_STAGES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => { setAuto(false); setStage(i); }}
              className="flex items-center gap-2 px-3 py-2 rounded text-xs font-mono-cyber transition-all"
              style={{
                background: stage === i ? `${s.color}22` : 'rgba(4,10,26,0.6)',
                border: `1px solid ${stage === i ? s.color : 'rgba(0,212,255,0.15)'}`,
                color: stage === i ? s.color : 'rgba(148,163,184,0.5)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: stage === i ? s.color : '#374151' }} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Simulate attack button */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={triggerAttack}
            className="btn-threat rounded px-8 py-4 font-orbitron text-sm font-bold uppercase tracking-widest flex items-center gap-3"
          >
            <Zap size={18} className="animate-pulse" />
            Simulate Attack
          </motion.button>
        </div>

        {/* Live metrics overlay */}
        <div className="absolute top-4 right-4 glass-card p-4 rounded space-y-2 min-w-[180px]">
          <div className="font-rajdhani text-xs text-neon-blue uppercase tracking-wider mb-3">Live Metrics</div>
          {[
            { label: 'Packets/sec', value: attackActive ? '52,847' : '1,240', alert: attackActive },
            { label: 'Active IPs', value: attackActive ? '3,891' : '142', alert: false },
            { label: 'CPU Load', value: attackActive ? '98%' : '23%', alert: attackActive },
            { label: 'Latency', value: attackActive ? '840ms' : '12ms', alert: attackActive },
          ].map(({ label, value, alert }) => (
            <div key={label} className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-mono-cyber">{label}</span>
              <span className={`font-mono-cyber font-semibold ${alert ? 'text-threat-red' : 'text-cyber-green'}`}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
