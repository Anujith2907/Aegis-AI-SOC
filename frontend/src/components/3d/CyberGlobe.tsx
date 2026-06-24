import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

interface CyberGlobeProps {
  attackActive?: boolean;
}

// Attack arc between two lat/lon points on a sphere
function latLonToVec3(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function buildArc(start: THREE.Vector3, end: THREE.Vector3, segments = 40, height = 0.4): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = new THREE.Vector3().lerpVectors(start, end, t);
    const h = Math.sin(t * Math.PI) * height;
    p.normalize().multiplyScalar(1.02 + h);
    pts.push(p);
  }
  return pts;
}

// Lat/lon of cities: [lat, lon, label]
const ATTACK_ROUTES: [number, number, number, number][] = [
  [39.9, 116.4, 51.5, -0.1],    // Beijing → London
  [55.7, 37.6, 40.7, -74.0],   // Moscow → New York
  [-23.5, -46.6, 48.8, 2.3],   // São Paulo → Paris
  [1.3, 103.8, 52.5, 13.4],    // Singapore → Berlin
  [35.6, 139.7, 37.5, -122.4], // Tokyo → San Francisco
  [28.6, 77.2, 51.5, -0.1],    // Delhi → London
  [-33.8, 151.2, 40.7, -74.0], // Sydney → New York
  [19.4, -99.1, 48.8, 2.3],    // Mexico City → Paris
];

function GlobeArcs({ attackActive }: { attackActive: boolean }) {
  const arcsData = useMemo(() => {
    return ATTACK_ROUTES.map(([lat1, lon1, lat2, lon2], i) => {
      const start = latLonToVec3(lat1, lon1, 1.02);
      const end = latLonToVec3(lat2, lon2, 1.02);
      const points = buildArc(start, end, 50, 0.35);
      return { points, key: i };
    });
  }, []);

  return (
    <>
      {arcsData.map(({ points, key }) => (
        <Line
          key={key}
          points={points}
          color={attackActive ? '#ff2244' : '#00d4ff'}
          lineWidth={attackActive ? 1.5 : 0.8}
          transparent
          opacity={attackActive ? 0.7 : 0.4}
        />
      ))}
    </>
  );
}

function GlobeParticles() {
  const ref = useRef<THREE.Points>(null);
  const { positions, colors } = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Random points on sphere surface
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 1.02;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      // Color: mix blue and cyan
      colors[i * 3] = 0;
      colors[i * 3 + 1] = 0.6 + Math.random() * 0.4;
      colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
    }
    return { positions, colors };
  }, []);

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.001;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.012} vertexColors transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function PulseRing({ radius, speed, delay }: { radius: number; speed: number; delay: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = ((state.clock.elapsedTime * speed + delay) % 1);
    const scale = 1 + t * 0.8;
    ref.current.scale.setScalar(scale);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.3;
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius, radius + 0.015, 64]} />
      <meshBasicMaterial color="#00d4ff" transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function CyberGlobe({ attackActive = false }: CyberGlobeProps) {
  const globeRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * (attackActive ? 0.4 : 0.15);
    }
  });

  return (
    <group ref={globeRef}>
      {/* Core globe */}
      <Sphere args={[1, 64, 64]}>
        <meshStandardMaterial
          color="#040a1a"
          emissive="#00d4ff"
          emissiveIntensity={0.04}
          metalness={0.5}
          roughness={0.8}
          transparent
          opacity={0.85}
        />
      </Sphere>

      {/* Wireframe overlay */}
      <Sphere args={[1.005, 24, 24]}>
        <meshBasicMaterial
          color={attackActive ? '#ff2244' : '#00d4ff'}
          wireframe
          transparent
          opacity={0.08}
        />
      </Sphere>

      {/* Outer glow shell */}
      <Sphere args={[1.05, 32, 32]}>
        <meshBasicMaterial
          color={attackActive ? '#ff2244' : '#00d4ff'}
          transparent
          opacity={0.03}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Dot particles on surface */}
      <GlobeParticles />

      {/* Attack arcs */}
      <GlobeArcs attackActive={attackActive} />

      {/* Equatorial pulse rings */}
      <PulseRing radius={1.08} speed={0.5} delay={0} />
      <PulseRing radius={1.08} speed={0.5} delay={0.33} />
      <PulseRing radius={1.08} speed={0.5} delay={0.66} />

      {/* Lights */}
      <pointLight color={attackActive ? '#ff2244' : '#00d4ff'} intensity={attackActive ? 3 : 1.2} distance={6} />
      <pointLight color="#8b5cf6" intensity={0.5} distance={4} position={[2, 1, 0]} />
    </group>
  );
}
