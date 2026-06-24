import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Torus, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface QuantumVortexProps {
  attackActive?: boolean;
}

// ── Vortex spiral particle field ─────────────────────────────────────────────
function VortexParticles({ attackActive }: { attackActive: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 2400;

  const { positions, colors, phases } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors    = new Float32Array(COUNT * 3);
    const phases    = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      // Distribute along a spiral / galaxy arm pattern
      const arm    = Math.floor(Math.random() * 3); // 3 spiral arms
      const t      = Math.pow(Math.random(), 0.6);   // denser toward center
      const radius = 0.15 + t * 1.6;
      const theta  = (arm / 3) * Math.PI * 2 + t * Math.PI * 3 + Math.random() * 0.4;
      const height = (Math.random() - 0.5) * (1 - t) * 0.7; // thinner at edges

      positions[i * 3]     = Math.cos(theta) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(theta) * radius;

      // Color gradient: center white→amber→orange→crimson at edges
      const frac = t;
      if (frac < 0.3) {
        // white-hot core
        colors[i * 3]     = 0.85;
        colors[i * 3 + 1] = 0.92;
        colors[i * 3 + 2] = 1.0;
      } else if (frac < 0.65) {
        // electric blue
        colors[i * 3]     = 0.23;
        colors[i * 3 + 1] = 0.51;
        colors[i * 3 + 2] = 0.97;
      } else {
        // indigo / deep blue
        colors[i * 3]     = 0.39 + Math.random() * 0.1;
        colors[i * 3 + 1] = 0.40;
        colors[i * 3 + 2] = 0.95;
      }

      phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions, colors, phases };
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t   = state.clock.elapsedTime;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    const spd = attackActive ? 1.8 : 0.55;

    for (let i = 0; i < COUNT; i++) {
      const x = positions[i * 3];
      const z = positions[i * 3 + 2];
      const r = Math.sqrt(x * x + z * z) || 0.001;
      // Angular velocity — faster near center (like a real galaxy)
      const omega = (spd * 0.5) / (r + 0.3);
      const angle = omega * t + phases[i] * 0;

      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      pos[i * 3]     = x * cos - z * sin;
      pos[i * 3 + 2] = x * sin + z * cos;
      // Subtle vertical drift
      pos[i * 3 + 1] = positions[i * 3 + 1] + Math.sin(t * 0.3 + phases[i]) * 0.015;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors,    3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        vertexColors
        transparent
        opacity={0.82}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ── Pulsing energy rings ─────────────────────────────────────────────────────
function EnergyRing({
  radius, tube, speed, delay, color, tiltX = 0, tiltZ = 0
}: {
  radius: number; tube: number; speed: number; delay: number;
  color: string; tiltX?: number; tiltZ?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    const t   = state.clock.elapsedTime * speed + delay;
    mat.emissiveIntensity = 0.6 + Math.sin(t) * 0.4;
    ref.current.rotation.z += 0.003 * speed;
  });
  return (
    <Torus ref={ref} args={[radius, tube, 12, 120]} rotation={[tiltX, 0, tiltZ]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.7} />
    </Torus>
  );
}

// ── Orbiting glyph spheres ───────────────────────────────────────────────────
function OrbitSphere({
  orbitRadius, speed, size, color, offset
}: {
  orbitRadius: number; speed: number; size: number; color: string; offset: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed + offset;
    ref.current.position.set(
      Math.cos(t) * orbitRadius,
      Math.sin(t * 0.7) * 0.3,
      Math.sin(t) * orbitRadius,
    );
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.8 + Math.sin(t * 3) * 0.3;
  });
  return (
    <Sphere ref={ref} args={[size, 12, 12]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
    </Sphere>
  );
}

// ── Central quantum core ─────────────────────────────────────────────────────
function QuantumCore({ attackActive }: { attackActive: boolean }) {
  const coreRef  = useRef<THREE.Mesh>(null);
  const glowRef  = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  const activeColor = attackActive ? '#ef4444' : '#3b82f6';
  const innerColor  = attackActive ? '#f97316' : '#dbeafe';

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.007;
      coreRef.current.rotation.x = Math.sin(t * 0.4) * 0.12;
    }
    if (glowRef.current) {
      const s = 1 + Math.sin(t * 2.5) * 0.12;
      glowRef.current.scale.setScalar(s);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.05 + Math.sin(t * 2) * 0.03;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= 0.012;
      innerRef.current.rotation.z += 0.008;
    }
  });

  return (
    <group>
      {/* Outer glow aura */}
      <Sphere ref={glowRef} args={[0.55, 32, 32]}>
        <meshBasicMaterial color={activeColor} transparent opacity={0.07} />
      </Sphere>
      {/* Solid core */}
      <Sphere ref={coreRef} args={[0.32, 48, 48]}>
        <meshStandardMaterial
          color={activeColor} emissive={activeColor}
          emissiveIntensity={1.2} metalness={0.9} roughness={0.05}
        />
      </Sphere>
      {/* Inner bright nucleus */}
      <Sphere ref={innerRef} args={[0.16, 24, 24]}>
        <meshStandardMaterial
          color={innerColor} emissive={innerColor}
          emissiveIntensity={2.5} metalness={1} roughness={0}
        />
      </Sphere>
      {/* Wireframe shell */}
      <Sphere args={[0.34, 14, 14]}>
        <meshBasicMaterial color={activeColor} wireframe transparent opacity={0.25} />
      </Sphere>
      {/* Core light */}
      <pointLight color={activeColor}  intensity={attackActive ? 4 : 2} distance={5} />
      <pointLight color={innerColor}   intensity={1} distance={2} />
    </group>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export function QuantumVortex({ attackActive = false }: QuantumVortexProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (attackActive ? 0.35 : 0.1);
    }
  });

  const blue   = '#3b82f6';
  const indigo  = '#6366f1';
  const cyan    = '#06b6d4';
  const sky     = '#38bdf8';

  return (
    <group ref={groupRef}>
      {/* Galaxy spiral particles */}
      <VortexParticles attackActive={attackActive} />

      {/* Energy rings at varying tilts */}
      <EnergyRing radius={0.70} tube={0.008} speed={1.2} delay={0}    color={blue}   tiltX={0.4} />
      <EnergyRing radius={0.95} tube={0.006} speed={0.8} delay={1}    color={indigo}  tiltX={-0.6} tiltZ={0.3} />
      <EnergyRing radius={1.20} tube={0.005} speed={0.5} delay={2}    color={cyan}    tiltX={1.1} tiltZ={-0.4} />
      <EnergyRing radius={1.50} tube={0.004} speed={0.3} delay={0.5}  color={sky}     tiltX={0.2} tiltZ={0.8} />

      {/* Orbiting micro-spheres */}
      <OrbitSphere orbitRadius={0.85} speed={1.1}  size={0.055} color={blue}   offset={0} />
      <OrbitSphere orbitRadius={1.10} speed={0.75} size={0.04}  color={cyan}   offset={2.1} />
      <OrbitSphere orbitRadius={1.35} speed={0.5}  size={0.035} color={indigo} offset={4.2} />

      {/* Central quantum core */}
      <QuantumCore attackActive={attackActive} />

      {/* Ambient lighting */}
      <ambientLight intensity={0.04} color="#020617" />
      <pointLight color={blue}   intensity={0.4} distance={8} position={[3, 1, 0]} />
      <pointLight color={indigo} intensity={0.3} distance={6} position={[-2, -1, 2]} />
    </group>
  );
}
