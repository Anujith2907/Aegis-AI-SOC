// Shared Types for AegisAI SOC

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'analyst' | 'viewer';
  avatar?: string;
  createdAt: string;
}

export type ThreatType =
  | 'DDoS'
  | 'Brute Force'
  | 'Malware'
  | 'Port Scan'
  | 'Unauthorized Access'
  | 'Normal Traffic';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface ThreatDetectionResult {
  id: string;
  threatType: ThreatType;
  confidence: number;
  severity: SeverityLevel;
  riskScore: number;
  affectedAssets: string[];
  timestamp: string;
  sourceIP: string;
  destinationIP: string;
  protocol: string;
  bytesTransferred: number;
  duration: number;
  attackTimeline: TimelineEvent[];
  businessImpact: string;
  priorityLevel: number;
  rootCause?: RootCauseAnalysis;
  similarIncidents?: SimilarIncident[];
}

export interface TimelineEvent {
  time: string;
  event: string;
  type: 'info' | 'warning' | 'critical';
}

export interface ShapFeature {
  feature: string;
  value: number;
  impact: number;
  description: string;
}

export interface RootCauseAnalysis {
  summary: string;
  shapFeatures: ShapFeature[];
  decisionPath: string[];
  investigationInsights: string[];
}

export interface SimilarIncident {
  id: string;
  title: string;
  threatType: ThreatType;
  severity: SeverityLevel;
  similarity: number;
  resolutionMethod: string;
  recoveryDuration: string;
  successRate: number;
  date: string;
}

export interface ThreatCluster {
  id: string;
  label: string;
  x: number;
  y: number;
  group: 'malware' | 'ddos' | 'insider' | 'port-scan' | 'brute-force';
  size: number;
}

export interface Incident {
  id: string;
  title: string;
  threatType: ThreatType;
  severity: SeverityLevel;
  status: 'open' | 'investigating' | 'contained' | 'resolved';
  timestamp: string;
  sourceIP: string;
  affectedSystems: number;
  assignedTo?: string;
  riskScore: number;
}

export interface DashboardStats {
  totalIncidents: number;
  activeThreats: number;
  securityScore: number;
  criticalAlerts: number;
  blockedAttacks: number;
  resolvedToday: number;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface ResponseAction {
  id: string;
  type: 'block_ip' | 'send_alert' | 'create_ticket' | 'notify_admin' | 'isolate_system';
  status: 'pending' | 'running' | 'completed' | 'failed';
  description: string;
  timestamp?: string;
}

export interface SecurityReport {
  id: string;
  title: string;
  generatedAt: string;
  executiveSummary: string;
  incidentTimeline: string;
  rootCauseAnalysis: string;
  impactAssessment: string;
  mitigationPlan: string;
  preventionStrategy: string;
}

export interface AttackTrendData {
  date: string;
  ddos: number;
  bruteForce: number;
  malware: number;
  portScan: number;
  unauthorized: number;
}

export interface ThreatIntelItem {
  id: string;
  source: string;
  description: string;
  severity: SeverityLevel;
  timestamp: string;
  ioc: string;
}
