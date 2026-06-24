import type { Incident, ThreatDetectionResult, AttackTrendData, ThreatIntelItem, SimilarIncident, ThreatCluster, ShapFeature } from '../types';

// ===== MOCK INCIDENTS =====
export const mockIncidents: Incident[] = [
  { id: '1', title: 'DDoS Attack on Web Server', threatType: 'DDoS', severity: 'critical', status: 'investigating', timestamp: '2026-06-23T08:12:00Z', sourceIP: '192.168.1.105', affectedSystems: 8, riskScore: 94 },
  { id: '2', title: 'Brute Force SSH Login Attempts', threatType: 'Brute Force', severity: 'high', status: 'contained', timestamp: '2026-06-23T07:45:00Z', sourceIP: '10.0.0.47', affectedSystems: 2, riskScore: 78 },
  { id: '3', title: 'Malware Detected in Endpoint', threatType: 'Malware', severity: 'critical', status: 'open', timestamp: '2026-06-23T06:30:00Z', sourceIP: '172.16.0.22', affectedSystems: 5, riskScore: 91 },
  { id: '4', title: 'Port Scan from External Source', threatType: 'Port Scan', severity: 'medium', status: 'resolved', timestamp: '2026-06-23T05:15:00Z', sourceIP: '203.0.113.45', affectedSystems: 1, riskScore: 52 },
  { id: '5', title: 'Unauthorized Admin Access', threatType: 'Unauthorized Access', severity: 'high', status: 'investigating', timestamp: '2026-06-23T04:00:00Z', sourceIP: '192.168.1.200', affectedSystems: 3, riskScore: 83 },
  { id: '6', title: 'Suspicious Network Scan', threatType: 'Port Scan', severity: 'low', status: 'resolved', timestamp: '2026-06-23T03:22:00Z', sourceIP: '10.0.0.88', affectedSystems: 1, riskScore: 31 },
  { id: '7', title: 'Ransomware Activity Detected', threatType: 'Malware', severity: 'critical', status: 'open', timestamp: '2026-06-23T02:10:00Z', sourceIP: '192.168.2.15', affectedSystems: 12, riskScore: 98 },
  { id: '8', title: 'SSH Brute Force Attempt', threatType: 'Brute Force', severity: 'medium', status: 'contained', timestamp: '2026-06-23T01:05:00Z', sourceIP: '198.51.100.7', affectedSystems: 1, riskScore: 61 },
];

// ===== MOCK DETECTION RESULT =====
export const mockDetectionResult: ThreatDetectionResult = {
  id: 'det-001',
  threatType: 'DDoS',
  confidence: 94.7,
  severity: 'critical',
  riskScore: 94,
  affectedAssets: ['web-server-01', 'load-balancer-02', 'cdn-node-03', 'api-gateway-01'],
  timestamp: new Date().toISOString(),
  sourceIP: '192.168.1.105',
  destinationIP: '10.0.0.1',
  protocol: 'UDP',
  bytesTransferred: 2847392,
  duration: 347,
  businessImpact: 'Service disruption affecting ~8,000 concurrent users. Estimated revenue loss: $12,400/hour.',
  priorityLevel: 1,
  attackTimeline: [
    { time: '08:10:23', event: 'Anomalous traffic spike detected from 192.168.1.105', type: 'warning' },
    { time: '08:10:45', event: 'Packet rate exceeded 50,000 pps threshold', type: 'critical' },
    { time: '08:11:02', event: 'DDoS pattern confirmed — UDP flood attack', type: 'critical' },
    { time: '08:11:15', event: 'Web Server 01 CPU at 98% — service degradation', type: 'critical' },
    { time: '08:11:30', event: 'Load balancer overwhelmed — failover triggered', type: 'warning' },
    { time: '08:12:00', event: 'AI Core initiated threat containment protocol', type: 'info' },
    { time: '08:12:18', event: 'Source IP blacklisted across all edge nodes', type: 'info' },
  ],
};

// ===== MOCK SHAP FEATURES =====
export const mockShapFeatures: ShapFeature[] = [
  { feature: 'packets_per_second', value: 52847, impact: 0.42, description: 'Extremely high packet rate — 52x normal baseline' },
  { feature: 'unique_src_ips', value: 1, impact: 0.28, description: 'Single source IP targeting multiple destinations' },
  { feature: 'payload_size_avg', value: 64, impact: 0.18, description: 'Minimal payload size consistent with UDP flood' },
  { feature: 'protocol_udp', value: 1, impact: 0.15, description: 'UDP protocol used — no handshake verification' },
  { feature: 'dst_port_variance', value: 0.02, impact: -0.09, description: 'Low port variance — concentrated attack vector' },
  { feature: 'duration_seconds', value: 347, impact: 0.12, description: 'Sustained attack over 5+ minutes' },
  { feature: 'bytes_per_second', value: 8204928, impact: 0.31, description: '8.2 MB/s throughput — 45x normal' },
];

// ===== MOCK SIMILAR INCIDENTS =====
export const mockSimilarIncidents: SimilarIncident[] = [
  { id: 'sim-001', title: 'UDP Flood Attack — Financial Sector', threatType: 'DDoS', severity: 'critical', similarity: 97.3, resolutionMethod: 'Rate limiting + BGP blackhole routing', recoveryDuration: '23 minutes', successRate: 98, date: '2026-05-15' },
  { id: 'sim-002', title: 'Amplification DDoS on E-commerce Platform', threatType: 'DDoS', severity: 'high', similarity: 89.1, resolutionMethod: 'Upstream filtering + CDN scrubbing', recoveryDuration: '45 minutes', successRate: 94, date: '2026-04-22' },
  { id: 'sim-003', title: 'Volume-Based Attack on API Gateway', threatType: 'DDoS', severity: 'critical', similarity: 82.7, resolutionMethod: 'Auto-scaling + IP reputation filtering', recoveryDuration: '18 minutes', successRate: 99, date: '2026-03-10' },
  { id: 'sim-004', title: 'SYN Flood Attack on Cloud Infrastructure', threatType: 'DDoS', severity: 'high', similarity: 76.4, resolutionMethod: 'SYN cookies enabled + firewall rules updated', recoveryDuration: '31 minutes', successRate: 96, date: '2026-02-28' },
  { id: 'sim-005', title: 'HTTP Flood DDoS — Layer 7', threatType: 'DDoS', severity: 'medium', similarity: 71.2, resolutionMethod: 'Challenge-response CAPTCHA + rate limiting', recoveryDuration: '12 minutes', successRate: 100, date: '2026-01-14' },
];

// ===== MOCK CLUSTERS =====
export const mockClusters: ThreatCluster[] = [
  ...Array.from({ length: 18 }, (_, i) => ({ id: `d${i}`, label: 'DDoS', x: -3 + Math.random() * 2, y: 2 + Math.random() * 2, group: 'ddos' as const, size: 5 + Math.random() * 10 })),
  ...Array.from({ length: 15 }, (_, i) => ({ id: `m${i}`, label: 'Malware', x: 3 + Math.random() * 2, y: 2 + Math.random() * 2, group: 'malware' as const, size: 5 + Math.random() * 12 })),
  ...Array.from({ length: 12 }, (_, i) => ({ id: `b${i}`, label: 'Brute Force', x: -3 + Math.random() * 2, y: -2 + Math.random() * 2, group: 'brute-force' as const, size: 4 + Math.random() * 8 })),
  ...Array.from({ length: 10 }, (_, i) => ({ id: `p${i}`, label: 'Port Scan', x: 3 + Math.random() * 2, y: -2 + Math.random() * 2, group: 'port-scan' as const, size: 3 + Math.random() * 6 })),
  ...Array.from({ length: 8 }, (_, i) => ({ id: `ins${i}`, label: 'Insider', x: 0 + Math.random() * 1, y: 0 + Math.random() * 1, group: 'insider' as const, size: 4 + Math.random() * 9 })),
];

// ===== MOCK ATTACK TRENDS =====
export const mockAttackTrends: AttackTrendData[] = [
  { date: 'Jan', ddos: 45, bruteForce: 28, malware: 32, portScan: 55, unauthorized: 12 },
  { date: 'Feb', ddos: 52, bruteForce: 35, malware: 28, portScan: 48, unauthorized: 18 },
  { date: 'Mar', ddos: 38, bruteForce: 42, malware: 45, portScan: 60, unauthorized: 22 },
  { date: 'Apr', ddos: 71, bruteForce: 38, malware: 38, portScan: 52, unauthorized: 15 },
  { date: 'May', ddos: 63, bruteForce: 55, malware: 52, portScan: 44, unauthorized: 28 },
  { date: 'Jun', ddos: 88, bruteForce: 48, malware: 61, portScan: 67, unauthorized: 34 },
];

// ===== MOCK THREAT INTEL =====
export const mockThreatIntel: ThreatIntelItem[] = [
  { id: 'ti-1', source: 'MITRE ATT&CK', description: 'New ransomware variant "BlackMamba" targeting healthcare sector', severity: 'critical', timestamp: '2026-06-23T08:00:00Z', ioc: '198.51.100.23' },
  { id: 'ti-2', source: 'CISA', description: 'Active exploitation of CVE-2026-1234 in Apache servers', severity: 'high', timestamp: '2026-06-23T07:30:00Z', ioc: 'CVE-2026-1234' },
  { id: 'ti-3', source: 'FBI IC3', description: 'Phishing campaign targeting financial institutions', severity: 'high', timestamp: '2026-06-23T06:15:00Z', ioc: 'phish-domain.com' },
  { id: 'ti-4', source: 'Shodan Monitor', description: 'Mass scanning of RDP ports (3389) from Tor exit nodes', severity: 'medium', timestamp: '2026-06-23T05:00:00Z', ioc: 'TOR exit nodes' },
  { id: 'ti-5', source: 'VirusTotal', description: 'New malware dropper hash confirmed malicious', severity: 'high', timestamp: '2026-06-23T04:30:00Z', ioc: 'sha256:a1b2c3...' },
];

// ===== COPILOT RESPONSES =====
export const copilotResponses: Record<string, string> = {
  ddos: `## DDoS Attack Analysis 🛡️\n\nThe detected **Distributed Denial of Service (DDoS)** attack exhibits a classic **UDP Flood** pattern.\n\n**Key Indicators:**\n- Packet rate: **52,847 pps** (52x baseline)\n- Source: Single IP flooding multiple endpoints\n- Protocol: UDP (connectionless, hard to filter)\n\n**Recommended Mitigation:**\n1. Enable BGP blackhole routing for attacking IP\n2. Activate upstream DDoS scrubbing\n3. Implement rate limiting at edge routers\n4. Scale out load balancers\n\n**Estimated Recovery:** 15-25 minutes with automated response`,
  malware: `## Malware Threat Analysis 🦠\n\nThe detected malware signature matches a **Ransomware variant** targeting Windows systems.\n\n**Behavioral Indicators:**\n- File encryption activity detected\n- C2 communication attempts to 203.0.113.50\n- Registry persistence mechanisms\n\n**Immediate Actions:**\n1. **Isolate affected systems** from network immediately\n2. Block C2 IP addresses at firewall\n3. Preserve memory dumps for forensics\n4. Restore from clean backups\n\n⚠️ **Do NOT pay ransom** — contact FBI CyberDivision`,
  default: `I'm analyzing your query against our threat intelligence database.\n\nBased on current incident data and historical patterns, I recommend:\n\n1. **Review** the latest threat intelligence feed\n2. **Verify** all critical system logs for anomalies\n3. **Update** firewall rules and IDS signatures\n4. **Enable** multi-factor authentication on all admin accounts\n\nWould you like me to run a deeper analysis or generate an incident report?`,
};

export function generateCopilotResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('ddos') || lower.includes('denial')) return copilotResponses.ddos;
  if (lower.includes('malware') || lower.includes('ransomware') || lower.includes('virus')) return copilotResponses.malware;
  return copilotResponses.default;
}
