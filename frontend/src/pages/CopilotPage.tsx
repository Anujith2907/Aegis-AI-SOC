import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Bot, User, Sparkles, RefreshCw, Copy, Shield } from 'lucide-react';
import { useCopilotStore } from '../store';
import { generateCopilotResponse } from '../data/mockData';
import type { CopilotMessage } from '../types';
import { copilotAPI } from '../api';

const QUICK_PROMPTS = [
  '🛡️ Analyze the latest DDoS attack',
  '🦠 Explain the malware detection',
  '📊 Generate incident summary',
  '🔍 Search similar incidents',
  '💡 Suggest mitigation strategies',
  '⚡ What is the current threat level?',
];

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h3 key={i} className="font-rajdhani font-bold text-neon-blue text-base mb-2 mt-3">{line.slice(3)}</h3>;
        if (line.startsWith('**') && line.endsWith('**')) return <strong key={i} className="text-slate-100 font-bold">{line.slice(2, -2)}</strong>;
        if (line.startsWith('- ')) return <li key={i} className="text-slate-300 ml-4 mb-1 list-disc">{line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1')}</li>;
        if (line.startsWith('1. ') || line.match(/^\d\./)) return <li key={i} className="text-slate-300 ml-4 mb-1 list-decimal">{line.replace(/^\d+\.\s/, '').replace(/\*\*(.*?)\*\*/g, '$1')}</li>;
        if (line.trim() === '') return <br key={i} />;
        return <p key={i} className="text-slate-300 mb-1">{line.replace(/\*\*(.*?)\*\*/g, (_, m) => m)}</p>;
      })}
    </div>
  );
}

export function CopilotPage() {
  const { messages, isTyping, addMessage, setTyping, clearMessages } = useCopilotStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setInput('');

    const userMsg: CopilotMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);
    setTyping(true);

    try {
      const historyPayload = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await copilotAPI.chat(text, historyPayload);
      const aiResponse = response.data.response;
      
      const aiMsg: CopilotMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: response.data.timestamp || new Date().toISOString(),
      };
      addMessage(aiMsg);
    } catch (error) {
      console.warn("Backend copilot API failed or offline. Falling back to local offline model response:", error);
      await new Promise((r) => setTimeout(r, 1000));
      const responseText = generateCopilotResponse(text);
      const aiMsg: CopilotMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString(),
      };
      addMessage(aiMsg);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-orbitron text-xl font-bold neon-text-blue flex items-center gap-2">
              <Sparkles size={20} className="text-electric-purple" />
              AI Security Copilot
            </h2>
            <p className="text-slate-500 text-sm font-mono-cyber mt-1">
              Powered by LangChain + Llama 3 + ChromaDB RAG
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 glass-card px-3 py-2 rounded">
              <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
              <span className="text-xs font-mono-cyber text-cyber-green">ONLINE</span>
            </div>
            <button onClick={clearMessages}
              className="btn-cyber rounded px-3 py-2 text-xs flex items-center gap-1">
              <RefreshCw size={12} />
              Clear
            </button>
          </div>
        </div>

        {/* Quick prompts */}
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_PROMPTS.map((p) => (
            <button key={p} onClick={() => sendMessage(p)}
              className="text-xs px-3 py-1.5 rounded font-mono-cyber transition-all hover:border-neon-blue/40 hover:text-neon-blue"
              style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', color: '#94a3b8' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
              msg.role === 'assistant'
                ? 'bg-gradient-to-br from-neon-blue/20 to-electric-purple/20 border border-neon-blue/30'
                : 'bg-gradient-to-br from-electric-purple/20 to-neon-blue/20 border border-electric-purple/30'
            }`}>
              {msg.role === 'assistant'
                ? <Bot size={14} className="text-neon-blue" />
                : <User size={14} className="text-electric-purple" />
              }
            </div>

            {/* Bubble */}
            <div className={`max-w-2xl ${msg.role === 'user' ? 'chat-message-user' : 'chat-message-ai'} rounded-lg`}>
              {msg.role === 'assistant'
                ? <MarkdownRenderer content={msg.content} />
                : <p className="text-sm text-slate-200">{msg.content}</p>
              }
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                <span className="text-xs text-slate-600 font-mono-cyber">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
                {msg.role === 'assistant' && (
                  <button onClick={() => navigator.clipboard.writeText(msg.content)}
                    className="text-slate-600 hover:text-neon-blue transition-colors">
                    <Copy size={11} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
                <Bot size={14} className="text-neon-blue" />
              </div>
              <div className="chat-message-ai rounded-lg flex items-center gap-2">
                <Shield size={12} className="text-neon-blue animate-pulse" />
                <span className="text-xs text-slate-400 font-mono-cyber">AI analyzing...</span>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-neon-blue"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 pt-3"
        style={{ background: 'rgba(4,10,26,0.8)', borderTop: '1px solid rgba(0,212,255,0.1)' }}>
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="Ask about threats, request analysis, or get mitigation advice..."
            className="cyber-input rounded-lg flex-1"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="btn-cyber-solid rounded-lg px-4 py-3 flex items-center gap-2 disabled:opacity-40"
          >
            <Send size={16} />
          </motion.button>
        </div>
        <p className="text-xs text-slate-600 font-mono-cyber mt-2 text-center">
          AegisAI SOC may make errors. Verify critical decisions with your security team.
        </p>
      </div>
    </div>
  );
}
