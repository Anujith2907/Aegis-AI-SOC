import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface DataPacketsProps {
  attackActive: boolean;
}

interface Packet {
  id: number;
  path: THREE.Vector3[];
  progress: number;
  speed: number;
  color: string;
  isAttack: boolean;
}

// Route paths for data packets
const ROUTES = [
  [[-5.5, 0.5, 0], [-1.8, 0, 0], [-3.5, -0.5, -1]], // attacker -> firewall -> server1
  [[-3.5, -0.5, -1], [0, -1.5, -2.5], [2, -0.5, 0]], // server1 -> router -> gateway
  [[2, -0.5, 0], [3.5, 1, -1.5]],                      // gateway -> cloud1
  [[2, -0.5, 0], [3.5, 1, 1.5]],                       // gateway -> cloud2
  [[-3.5, -0.5, 1.5], [0, -1.5, 2.5], [2, -0.5, 0]],  // server2 -> router2 -> gateway
];

export function DataPackets({ attackActive }: DataPacketsProps) {
  const packetsRef = useRef<Packet[]>([]);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const PACKET_COUNT = attackActive ? 20 : 10;

  const packets = useMemo<Packet[]>(() => {
    return Array.from({ length: PACKET_COUNT }, (_, i) => {
      const isAttack = attackActive && i < 8;
      const routeIdx = isAttack ? 0 : (i % (ROUTES.length - 1)) + 1;
      const route = ROUTES[routeIdx];
      return {
        id: i,
        path: route.map((p) => new THREE.Vector3(...(p as [number, number, number]))),
        progress: Math.random(),
        speed: isAttack ? 0.6 + Math.random() * 0.4 : 0.2 + Math.random() * 0.2,
        color: isAttack ? '#ff2244' : '#00d4ff',
        isAttack,
      };
    });
  }, [attackActive]);

  packetsRef.current = packets;

  useFrame((_, delta) => {
    packetsRef.current.forEach((packet, i) => {
      packet.progress += delta * packet.speed;
      if (packet.progress >= 1) packet.progress = 0;

      const mesh = meshRefs.current[i];
      if (!mesh || packet.path.length < 2) return;

      const pathLen = packet.path.length - 1;
      const t = packet.progress * pathLen;
      const segIdx = Math.min(Math.floor(t), pathLen - 1);
      const segT = t - segIdx;

      const start = packet.path[segIdx];
      const end = packet.path[segIdx + 1];
      mesh.position.lerpVectors(start, end, segT);
    });
  });

  return (
    <group>
      {packets.map((packet, i) => (
        <Sphere
          key={packet.id}
          ref={(el) => { meshRefs.current[i] = el; }}
          args={[0.04, 8, 8]}
        >
          <meshStandardMaterial
            color={packet.color}
            emissive={packet.color}
            emissiveIntensity={2}
          />
        </Sphere>
      ))}
    </group>
  );
}
