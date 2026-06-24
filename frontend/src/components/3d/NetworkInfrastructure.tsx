import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder, Line, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

interface NetworkNode {
  id: string;
  position: [number, number, number];
  type: 'server' | 'firewall' | 'router' | 'cloud' | 'gateway';
  label: string;
  color: string;
  attackTarget?: boolean;
}

interface NetworkInfrastructureProps {
  attackActive: boolean;
  attackNodeId?: string;
}

const NODES: NetworkNode[] = [
  { id: 'server1', position: [-3.5, -0.5, -1], type: 'server', label: 'Web Server', color: '#00d4ff' },
  { id: 'server2', position: [-3.5, -0.5, 1.5], type: 'server', label: 'DB Server', color: '#00d4ff' },
  { id: 'firewall1', position: [-1.8, 0, 0], type: 'firewall', label: 'Firewall', color: '#00ff88' },
  { id: 'router1', position: [0, -1.5, -2.5], type: 'router', label: 'Router', color: '#8b5cf6' },
  { id: 'router2', position: [0, -1.5, 2.5], type: 'router', label: 'Router', color: '#8b5cf6' },
  { id: 'cloud1', position: [3.5, 1, -1.5], type: 'cloud', label: 'AWS Cloud', color: '#00d4ff' },
  { id: 'cloud2', position: [3.5, 1, 1.5], type: 'cloud', label: 'Azure', color: '#8b5cf6' },
  { id: 'gateway', position: [2, -0.5, 0], type: 'gateway', label: 'Security GW', color: '#00ff88' },
  { id: 'attacker', position: [-5.5, 0.5, 0], type: 'server', label: 'THREAT SOURCE', color: '#ff2244', attackTarget: true },
];

const CONNECTIONS = [
  ['attacker', 'firewall1'],
  ['firewall1', 'server1'],
  ['firewall1', 'server2'],
  ['server1', 'router1'],
  ['server2', 'router2'],
  ['router1', 'gateway'],
  ['router2', 'gateway'],
  ['gateway', 'cloud1'],
  ['gateway', 'cloud2'],
];

function ServerRack({ position, color, attackMode }: { position: [number, number, number]; color: string; attackMode: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current && attackMode) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 10) * 0.02;
    }
  });
  return (
    <group ref={ref} position={position}>
      <Box args={[0.5, 0.8, 0.3]}>
        <meshStandardMaterial color="#0a1628" metalness={0.9} roughness={0.2} />
      </Box>
      {[0, 0.15, 0.3].map((y, i) => (
        <Box key={i} args={[0.42, 0.08, 0.25]} position={[0, -0.3 + y, 0]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} metalness={0.8} />
        </Box>
      ))}
      <pointLight color={color} intensity={attackMode ? 0.8 : 0.3} distance={1.5} />
    </group>
  );
}

function CloudNode({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(s.clock.elapsedTime * 0.8) * 0.1;
    }
  });
  return (
    <Sphere ref={ref} args={[0.35, 16, 16]} position={position}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.7} />
    </Sphere>
  );
}

export function NetworkInfrastructure({ attackActive, attackNodeId }: NetworkInfrastructureProps) {
  const nodeMap = useMemo(() => {
    const map: Record<string, NetworkNode> = {};
    NODES.forEach((n) => (map[n.id] = n));
    return map;
  }, []);

  return (
    <group>
      {/* Connections */}
      {CONNECTIONS.map(([from, to], i) => {
        const a = nodeMap[from];
        const b = nodeMap[to];
        const isAttackPath = attackActive && (from === 'attacker' || to === 'attacker' || from === 'firewall1');
        if (!a || !b) return null;
        return (
          <Line
            key={i}
            points={[a.position, b.position]}
            color={isAttackPath ? '#ff2244' : '#00d4ff'}
            lineWidth={isAttackPath ? 2 : 0.8}
            transparent
            opacity={isAttackPath ? 0.9 : 0.3}
          />
        );
      })}

      {/* Nodes */}
      {NODES.map((node) => {
        const isAttacker = node.id === 'attacker';
        const isUnderAttack = attackActive && (node.id === 'server1' || node.id === 'firewall1');
        const color = isAttacker && attackActive ? '#ff0000' : isUnderAttack ? '#ff8800' : node.color;

        if (node.type === 'cloud') return <CloudNode key={node.id} position={node.position} color={color} />;
        return (
          <group key={node.id}>
            <ServerRack position={node.position} color={color} attackMode={isAttacker && attackActive} />
            {attackActive && isAttacker && (
              <pointLight color="#ff0000" intensity={2} distance={3} position={node.position} />
            )}
          </group>
        );
      })}
    </group>
  );
}
