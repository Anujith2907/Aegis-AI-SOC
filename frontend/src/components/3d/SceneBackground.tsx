import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── Drifting Particle Field (subtle, sparse) ─────────────────────────────────
function DriftParticles() {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 180;

  const { positions, speeds, phases } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const speeds    = new Float32Array(COUNT);
    const phases    = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 4;
      speeds[i] = 0.002 + Math.random() * 0.004;
      phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions, speeds, phases };
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     += speeds[i] * Math.sin(t * 0.1 + phases[i]);
      pos[i * 3 + 1] += speeds[i] * 0.3;
      // wrap around
      if (pos[i * 3 + 1] > 7) pos[i * 3 + 1] = -7;
      if (pos[i * 3] > 12) pos[i * 3] = -12;
      if (pos[i * 3] < -12) pos[i * 3] = 12;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#3b82f6" size={0.04} transparent opacity={0.25} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// ── Floating Orbs (glowing blue spheres that drift slowly) ───────────────────
function FloatingOrbs() {
  const orbData = useMemo(() => [
    { pos: [-5, 2, -6] as [number, number, number], speed: 0.3, size: 0.12, color: '#3b82f6' },
    { pos: [6, -1, -5] as [number, number, number], speed: 0.2, size: 0.09, color: '#6366f1' },
    { pos: [-3, -3, -7] as [number, number, number], speed: 0.4, size: 0.07, color: '#06b6d4' },
    { pos: [4, 3, -8] as [number, number, number], speed: 0.15, size: 0.1, color: '#818cf8' },
    { pos: [-7, 0, -4] as [number, number, number], speed: 0.25, size: 0.06, color: '#38bdf8' },
  ], []);

  return (
    <group>
      {orbData.map((orb, i) => (
        <OrbMesh key={i} {...orb} index={i} />
      ))}
    </group>
  );
}

function OrbMesh({ pos, speed, size, color, index }: {
  pos: [number, number, number]; speed: number; size: number; color: string; index: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed;
    ref.current.position.x = pos[0] + Math.sin(t + index) * 1.5;
    ref.current.position.y = pos[1] + Math.cos(t * 0.7 + index * 2) * 0.8;
    ref.current.position.z = pos[2] + Math.sin(t * 0.5) * 0.5;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.6 + Math.sin(t * 3) * 0.4;
    const s = 1 + Math.sin(t * 2) * 0.15;
    ref.current.scale.setScalar(s);
  });
  return (
    <mesh ref={ref} position={pos}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.6} />
    </mesh>
  );
}

// ── Pulsing Grid Lines (horizontal scan lines) ──────────────────────────────
function PulseGrid() {
  const ref = useRef<THREE.Group>(null);
  const lines = useMemo(() => {
    const arr: { y: number; phase: number }[] = [];
    for (let i = 0; i < 8; i++) {
      arr.push({ y: (i - 4) * 1.6, phase: Math.random() * Math.PI * 2 });
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.children.forEach((child, i) => {
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = 0.015 + Math.sin(t * 0.5 + lines[i].phase) * 0.012;
    });
  });

  return (
    <group ref={ref} position={[0, 0, -10]}>
      {lines.map((line, i) => (
        <mesh key={i} position={[0, line.y, 0]}>
          <planeGeometry args={[30, 0.006]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.02} />
        </mesh>
      ))}
    </group>
  );
}

// ── Main Scene Export ────────────────────────────────────────────────────────
export function SceneBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <DriftParticles />
          <FloatingOrbs />
          <PulseGrid />
          <ambientLight intensity={0.02} />
        </Suspense>
      </Canvas>
    </div>
  );
}
