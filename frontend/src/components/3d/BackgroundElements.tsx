import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FloatingParticlesProps {
  count?: number;
  attackActive?: boolean;
}

export function FloatingParticles({ count = 300, attackActive = false }: FloatingParticlesProps) {
  const ref = useRef<THREE.Points>(null);

  const { positions, velocities, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
      velocities[i * 3] = (Math.random() - 0.5) * 0.005;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.004;
      velocities[i * 3 + 2] = 0;
      sizes[i] = Math.random() * 3 + 0.5;
    }
    return { positions, velocities, sizes };
  }, [count]);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3] += velocities[i * 3] * (attackActive ? 3 : 1);
      pos[i * 3 + 1] += velocities[i * 3 + 1] * (attackActive ? 3 : 1);
      // Wrap around
      if (pos[i * 3] > 10) pos[i * 3] = -10;
      if (pos[i * 3] < -10) pos[i * 3] = 10;
      if (pos[i * 3 + 1] > 7) pos[i * 3 + 1] = -7;
      if (pos[i * 3 + 1] < -7) pos[i * 3 + 1] = 7;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        color={attackActive ? '#ef4444' : '#3b82f6'}
        size={0.05}
        transparent
        opacity={0.35}
        sizeAttenuation
      />
    </points>
  );
}

// Animated holographic hex grid
export function HexGrid({ rows = 6, cols = 8, attackActive = false }: { rows?: number; cols?: number; attackActive?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshes = useRef<THREE.Mesh[]>([]);
  const phases = useMemo(() => {
    const p: number[] = [];
    for (let i = 0; i < rows * cols; i++) p.push(Math.random() * Math.PI * 2);
    return p;
  }, [rows, cols]);

  const hexPositions = useMemo(() => {
    const pos: [number, number, number][] = [];
    const hexW = 1.2;
    const hexH = 1.04;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c - cols / 2) * hexW + (r % 2 === 0 ? 0 : hexW / 2);
        const y = (r - rows / 2) * hexH * 0.86;
        pos.push([x, y, 0]);
      }
    }
    return pos;
  }, [rows, cols]);

  useFrame((state) => {
    if (!groupRef.current) return;
    meshes.current.forEach((mesh, i) => {
      if (!mesh) return;
      const t = state.clock.elapsedTime;
      const wave = Math.sin(t * 0.8 + phases[i]) * 0.5 + 0.5;
      (mesh.material as THREE.MeshBasicMaterial).opacity = (attackActive ? 0.15 : 0.06) + wave * 0.08;
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, -8]}>
      {hexPositions.map((pos, i) => (
        <mesh
          key={i}
          position={pos}
          ref={(el) => { if (el) meshes.current[i] = el; }}
        >
          <cylinderGeometry args={[0.5, 0.5, 0.02, 6]} />
          <meshBasicMaterial
            color={attackActive ? '#ef4444' : '#3b82f6'}
            transparent
            opacity={0.06}
            wireframe
          />
        </mesh>
      ))}
    </group>
  );
}
