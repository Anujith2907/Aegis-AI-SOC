import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface SecurityShieldProps {
  active: boolean;
}

export function SecurityShield({ active }: SecurityShieldProps) {
  const shieldRef = useRef<THREE.Mesh>(null);
  const wave1Ref = useRef<THREE.Mesh>(null);
  const wave2Ref = useRef<THREE.Mesh>(null);
  const wave1Scale = useRef(1);
  const wave2Scale = useRef(1.3);

  useFrame((state, delta) => {
    if (!active) return;

    const t = state.clock.elapsedTime;

    if (shieldRef.current) {
      (shieldRef.current.material as THREE.MeshStandardMaterial).opacity =
        0.06 + Math.sin(t * 3) * 0.03;
    }

    // Expanding wave rings
    wave1Scale.current += delta * 0.8;
    wave2Scale.current += delta * 0.8;
    if (wave1Scale.current > 3) wave1Scale.current = 0.8;
    if (wave2Scale.current > 3) wave2Scale.current = 0.8;

    if (wave1Ref.current) {
      wave1Ref.current.scale.setScalar(wave1Scale.current);
      (wave1Ref.current.material as THREE.MeshBasicMaterial).opacity =
        Math.max(0, 0.5 - wave1Scale.current * 0.15);
    }
    if (wave2Ref.current) {
      wave2Ref.current.scale.setScalar(wave2Scale.current);
      (wave2Ref.current.material as THREE.MeshBasicMaterial).opacity =
        Math.max(0, 0.5 - wave2Scale.current * 0.15);
    }
  });

  if (!active) return null;

  return (
    <group>
      {/* Shield dome */}
      <Sphere ref={shieldRef} args={[4.8, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]}>
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={0.3}
          transparent
          opacity={0.07}
          side={THREE.DoubleSide}
          wireframe={false}
        />
      </Sphere>

      {/* Shield wireframe */}
      <Sphere args={[4.82, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]}>
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.15} wireframe />
      </Sphere>

      {/* Energy waves */}
      <Sphere ref={wave1Ref} args={[1.5, 16, 16]}>
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.3} wireframe />
      </Sphere>
      <Sphere ref={wave2Ref} args={[1.5, 16, 16]}>
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.25} wireframe />
      </Sphere>

      {/* Shield ambient light */}
      <ambientLight color="#00d4ff" intensity={0.3} />
    </group>
  );
}
