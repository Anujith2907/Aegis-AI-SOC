import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Torus, Line } from '@react-three/drei';
import * as THREE from 'three';

interface AICoreProps {
  attackActive: boolean;
}

export function AICore({ attackActive }: AICoreProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const outerGlowRef = useRef<THREE.Mesh>(null);

  // Neural network connections
  const neuralLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 1.2;
      const end = [Math.cos(angle) * radius, Math.sin(angle) * 0.5, Math.sin(angle) * radius] as [number, number, number];
      lines.push({ start: [0, 0, 0] as [number, number, number], end, key: i });
    }
    return lines;
  }, []);

  const coreColor = attackActive ? '#ff2244' : '#00d4ff';
  const glowColor = attackActive ? '#ff4400' : '#0088aa';

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.005;
      coreRef.current.rotation.x = Math.sin(t * 0.5) * 0.1;
      const scale = 1 + Math.sin(t * 2) * 0.05;
      coreRef.current.scale.setScalar(scale);
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += 0.01;
      ring1Ref.current.rotation.z += 0.007;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y += 0.008;
      ring2Ref.current.rotation.x -= 0.005;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z += 0.012;
      ring3Ref.current.rotation.y -= 0.009;
    }
    if (outerGlowRef.current) {
      const pulse = 1 + Math.sin(t * 3) * 0.15;
      outerGlowRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer glow */}
      <Sphere ref={outerGlowRef} args={[0.85, 32, 32]}>
        <meshBasicMaterial color={glowColor} transparent opacity={0.05} />
      </Sphere>

      {/* Core sphere */}
      <Sphere ref={coreRef} args={[0.55, 64, 64]}>
        <meshStandardMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
          wireframe={false}
        />
      </Sphere>

      {/* Wireframe overlay */}
      <Sphere args={[0.57, 16, 16]}>
        <meshBasicMaterial color={coreColor} wireframe transparent opacity={0.3} />
      </Sphere>

      {/* Energy rings */}
      <Torus ref={ring1Ref} args={[0.85, 0.015, 16, 100]}>
        <meshStandardMaterial color={coreColor} emissive={coreColor} emissiveIntensity={1.2} />
      </Torus>
      <Torus ref={ring2Ref} args={[1.1, 0.01, 16, 100]}>
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.8} />
      </Torus>
      <Torus ref={ring3Ref} args={[1.35, 0.008, 16, 100]}>
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.6} />
      </Torus>

      {/* Neural network lines */}
      {neuralLines.map((line) => (
        <Line
          key={line.key}
          points={[line.start, line.end]}
          color={attackActive ? '#ff2244' : '#00d4ff'}
          lineWidth={0.5}
          transparent
          opacity={0.4}
        />
      ))}

      {/* Point light for glow */}
      <pointLight color={coreColor} intensity={attackActive ? 3 : 1.5} distance={4} />
    </group>
  );
}
