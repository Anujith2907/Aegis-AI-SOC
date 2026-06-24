import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Incident, DashboardStats, CopilotMessage, ThreatDetectionResult } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

interface AppState {
  sidebarOpen: boolean;
  currentPage: string;
  attackSimulationActive: boolean;
  toggleSidebar: () => void;
  setCurrentPage: (page: string) => void;
  setAttackSimulation: (active: boolean) => void;
}

interface ThreatState {
  detectionResult: ThreatDetectionResult | null;
  incidents: Incident[];
  stats: DashboardStats;
  isScanning: boolean;
  setDetectionResult: (result: ThreatDetectionResult | null) => void;
  addIncident: (incident: Incident) => void;
  setScanning: (scanning: boolean) => void;
  updateStats: (stats: Partial<DashboardStats>) => void;
}

interface CopilotState {
  messages: CopilotMessage[];
  isTyping: boolean;
  addMessage: (msg: CopilotMessage) => void;
  setTyping: (typing: boolean) => void;
  clearMessages: () => void;
}

// ===== AUTH STORE =====
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    { name: 'aegisai-auth' }
  )
);

// ===== APP STORE =====
export const useAppStore = create<AppState>()((set) => ({
  sidebarOpen: true,
  currentPage: 'dashboard',
  attackSimulationActive: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setCurrentPage: (page) => set({ currentPage: page }),
  setAttackSimulation: (active) => set({ attackSimulationActive: active }),
}));

// ===== THREAT STORE =====
export const useThreatStore = create<ThreatState>()((set) => ({
  detectionResult: null,
  incidents: [],
  isScanning: false,
  stats: {
    totalIncidents: 1247,
    activeThreats: 23,
    securityScore: 87,
    criticalAlerts: 5,
    blockedAttacks: 3891,
    resolvedToday: 18,
  },
  setDetectionResult: (result) => set({ detectionResult: result }),
  addIncident: (incident) =>
    set((state) => ({
      incidents: [incident, ...state.incidents],
      stats: {
        ...state.stats,
        totalIncidents: state.stats.totalIncidents + 1,
        activeThreats: state.stats.activeThreats + 1,
      },
    })),
  setScanning: (scanning) => set({ isScanning: scanning }),
  updateStats: (updates) =>
    set((state) => ({ stats: { ...state.stats, ...updates } })),
}));

// ===== COPILOT STORE =====
export const useCopilotStore = create<CopilotState>()((set) => ({
  messages: [
    {
      id: '1',
      role: 'assistant',
      content: `🛡️ **AegisAI SOC Copilot Online**\n\nI'm your AI-powered security analyst. I can help you:\n- Analyze and explain detected threats\n- Suggest mitigation strategies\n- Search through incident history\n- Generate investigation summaries\n- Answer cybersecurity questions\n\nHow can I assist you today?`,
      timestamp: new Date().toISOString(),
    },
  ],
  isTyping: false,
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setTyping: (typing) => set({ isTyping: typing }),
  clearMessages: () => set({ messages: [] }),
}));
