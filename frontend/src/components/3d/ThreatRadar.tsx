import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Torus, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

interface ThreatRadarProps {
  attackActive: boolean;
}

export function ThreatRadar({ attackActive }: ThreatRadarProps) {
  const sweepRef = useRef<THREE.Mesh>(null);
  const angle = useRef(0);

  useFrame((_, delta) => {
    angle.current += delta * (attackActive ? 2.5 : 1.2);
    if (sweepRef.current) {
      sweepRef.current.rotation.y = angle.current;
    }
  });

  return (
    <group position={[0, -2.5, 0]} rotation={[0, 0, 0]}>
      {/* Radar rings */}
      {[1.5, 2.5, 3.5, 4.5].map((r, i) => (
        <Torus key={i} args={[r, 0.008, 8, 64]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial
            color="#00d4ff"
            transparent
            opacity={0.15 - i * 0.03}
          />
        </Torus>
      ))}

      {/* Radar sweep plane */}
      <mesh ref={sweepRef} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.5, 32, 0, Math.PI / 4]} />
        <meshBasicMaterial
          color={attackActive ? '#ff2244' : '#00d4ff'}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Center post */}
      <Cylinder args={[0.02, 0.02, 0.3, 8]} position={[0, 0.15, 0]}>
        <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={1} />
      </Cylinder>

      {/* Threat blips when attacking */}
      {attackActive && (
        <>
          {[
            [-3.2, 0.05, -1.5],
            [2.1, 0.05, 3.0],
            [-1.8, 0.05, 2.8],
          ].map(([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshBasicMaterial color="#ff2244" />
              <pointLight color="#ff2244" intensity={0.5} distance={0.5} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}
