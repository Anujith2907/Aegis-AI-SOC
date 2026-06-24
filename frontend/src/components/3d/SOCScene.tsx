import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Preload } from '@react-three/drei';
import { Suspense } from 'react';
import { AICore } from './AICore';
import { NetworkInfrastructure } from './NetworkInfrastructure';
import { DataPackets } from './DataPackets';
import { ThreatRadar } from './ThreatRadar';
import { SecurityShield } from './SecurityShield';

interface SOCSceneProps {
  attackActive: boolean;
  shieldActive: boolean;
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.15} color="#040a1a" />
      <directionalLight position={[5, 10, 5]} intensity={0.3} color="#00d4ff" />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#8b5cf6" distance={15} />
      <pointLight position={[5, -3, 5]} intensity={0.3} color="#00ff88" distance={12} />
    </>
  );
}

function GridFloor() {
  return (
    <gridHelper args={[20, 30, '#00d4ff', '#0d2545']} position={[0, -3, 0]}>
      <meshBasicMaterial transparent opacity={0.2} />
    </gridHelper>
  );
}

export function SOCScene({ attackActive, shieldActive }: SOCSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 2, 8], fov: 60, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <SceneLighting />
        <Stars radius={80} depth={50} count={3000} factor={3} saturation={0} fade speed={0.5} />
        <GridFloor />

        {/* Core Components */}
        <AICore attackActive={attackActive} />
        <NetworkInfrastructure attackActive={attackActive} />
        <DataPackets attackActive={attackActive} />
        <ThreatRadar attackActive={attackActive} />
        <SecurityShield active={shieldActive} />

        {/* Camera controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={4}
          maxDistance={15}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 6}
          autoRotate
          autoRotateSpeed={attackActive ? 0.3 : 0.5}
        />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
