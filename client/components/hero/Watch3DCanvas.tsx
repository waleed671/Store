'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, ContactShadows, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function OrbitingGlowRings({ selectedColor = 'obsidian', isExploded = false }: { selectedColor?: string; isExploded?: boolean }) {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);

  const glowColors: Record<string, string> = {
    obsidian: '#3b82f6',
    gold: '#f59e0b',
    cyan: '#06b6d4',
    rose: '#f43f5e',
  };

  const glow = glowColors[selectedColor] || '#06b6d4';

  useFrame((_, delta) => {
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x += delta * (isExploded ? 0.6 : 0.2);
      outerRingRef.current.rotation.y += delta * (isExploded ? 0.4 : 0.15);
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.x -= delta * (isExploded ? 0.7 : 0.25);
      innerRingRef.current.rotation.z += delta * (isExploded ? 0.5 : 0.2);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Glow Halo Ring */}
      <mesh ref={outerRingRef} scale={isExploded ? 1.3 : 1}>
        <torusGeometry args={[1.45, 0.015, 32, 100]} />
        <meshStandardMaterial
          color={glow}
          metalness={0.9}
          roughness={0.1}
          emissive={glow}
          emissiveIntensity={isExploded ? 3.0 : 1.8}
        />
      </mesh>

      {/* Inner Accent Orbital Line */}
      <mesh ref={innerRingRef} rotation={[Math.PI / 3, 0, 0]} scale={isExploded ? 1.2 : 1}>
        <torusGeometry args={[1.65, 0.01, 32, 100]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.95}
          roughness={0.05}
          emissive="#ffffff"
          emissiveIntensity={isExploded ? 2.0 : 1.0}
        />
      </mesh>
    </group>
  );
}

function LuxuryWatchModel({ selectedColor = 'obsidian', isExploded = false }: { selectedColor?: string; isExploded?: boolean }) {
  const watchGroup = useRef<THREE.Group>(null);
  const secondHandRef = useRef<THREE.Group>(null);
  const hourHandRef = useRef<THREE.Group>(null);
  const minuteHandRef = useRef<THREE.Group>(null);
  const tourbillonGearRef = useRef<THREE.Mesh>(null);
  const subGearRef = useRef<THREE.Mesh>(null);

  const dialColors: Record<string, string> = {
    obsidian: '#0f172a',
    gold: '#18181b',
    cyan: '#0c4a6e',
    rose: '#27272a',
  };

  const bezelColors: Record<string, string> = {
    obsidian: '#e2e8f0',
    gold: '#fbbf24',
    cyan: '#38bdf8',
    rose: '#fb7185',
  };

  const currentDialColor = dialColors[selectedColor] || '#0f172a';
  const currentBezelColor = bezelColors[selectedColor] || '#e2e8f0';

  // Smooth lerped explosion distances
  const glassY = isExploded ? 0.75 : 0.12;
  const bezelY = isExploded ? 0.5 : 0.1;
  const dialY = isExploded ? 0.25 : 0.08;
  const tourbillonY = isExploded ? 0.0 : 0.05;
  const caseY = isExploded ? -0.35 : 0.0;
  const strapY = isExploded ? -0.55 : -0.05;

  useFrame((_, delta) => {
    if (watchGroup.current && !isExploded) {
      watchGroup.current.rotation.y += delta * 0.15;
    }
    if (secondHandRef.current) {
      secondHandRef.current.rotation.y -= delta * 1.5;
    }
    if (minuteHandRef.current) {
      minuteHandRef.current.rotation.y -= delta * 0.08;
    }
    if (hourHandRef.current) {
      hourHandRef.current.rotation.y -= delta * 0.01;
    }
    if (tourbillonGearRef.current) {
      tourbillonGearRef.current.rotation.z += delta * 2.5;
    }
    if (subGearRef.current) {
      subGearRef.current.rotation.z -= delta * 3.2;
    }
  });

  return (
    <group ref={watchGroup} position={[0, 0, 0]} rotation={[0.4, -0.3, 0]}>
      
      {/* 1. Sapphire Glass Lens Dome */}
      <group position={[0, glassY, 0]}>
        <mesh>
          <cylinderGeometry args={[0.92, 0.92, 0.03, 64]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.9}
            opacity={0.35}
            transparent={true}
            roughness={0.05}
            metalness={0.1}
            ior={1.5}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
          />
        </mesh>
      </group>

      {/* 2. Dual-Tone Luxury Bezel */}
      <group position={[0, bezelY, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.92, 0.07, 32, 100]} />
          <meshStandardMaterial
            color={currentBezelColor}
            metalness={0.95}
            roughness={0.12}
            envMapIntensity={2.5}
          />
        </mesh>
      </group>

      {/* 3. Skeleton Dial Plate with 12 Hours Markers */}
      <group position={[0, dialY, 0]}>
        {/* Main Ceramic Sunburst Dial Plate */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.88, 0.88, 0.02, 64]} />
          <meshStandardMaterial
            color={currentDialColor}
            metalness={0.7}
            roughness={0.25}
          />
        </mesh>

        {/* 12 Hour Markers (3D Polished Metallic Studs) */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * Math.PI) / 6;
          const radius = 0.78;
          const x = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius;

          return (
            <mesh key={i} position={[x, 0.02, z]} rotation={[0, angle, 0]}>
              <boxGeometry args={[0.04, 0.03, 0.09]} />
              <meshStandardMaterial
                color={i % 3 === 0 ? '#fbbf24' : '#ffffff'}
                metalness={0.95}
                roughness={0.05}
                emissive={i % 3 === 0 ? '#fbbf24' : '#ffffff'}
                emissiveIntensity={0.6}
              />
            </mesh>
          );
        })}

        {/* Brand Inscription Plate */}
        <mesh position={[0, 0.02, -0.4]}>
          <boxGeometry args={[0.38, 0.01, 0.1]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Real Ticking Hands (Hour, Minute, Sweeping Second) */}
        <group position={[0, 0.03, 0]}>
          {/* Hour Hand */}
          <group ref={hourHandRef}>
            <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.05, 0.4, 0.02]} />
              <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} emissive="#ffffff" emissiveIntensity={0.5} />
            </mesh>
          </group>

          {/* Minute Hand */}
          <group ref={minuteHandRef}>
            <mesh position={[0, 0, 0.32]} rotation={[Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.035, 0.65, 0.02]} />
              <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} emissive="#ffffff" emissiveIntensity={0.5} />
            </mesh>
          </group>

          {/* Sweeping Second Hand */}
          <group ref={secondHandRef}>
            <mesh position={[0, 0, 0.36]} rotation={[Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.015, 0.72, 0.015]} />
              <meshStandardMaterial color="#ef4444" metalness={0.8} roughness={0.1} emissive="#ef4444" emissiveIntensity={1.2} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.04, 32]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.05} />
            </mesh>
          </group>
        </group>
      </group>

      {/* 4. Skeletonized Spinning Tourbillon Escapement at 6 O'Clock */}
      <group position={[0, tourbillonY, 0.35]}>
        <mesh ref={tourbillonGearRef} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.18, 0.02, 16, 32]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.1} />
        </mesh>
        <mesh ref={subGearRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.02, 12]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* 5. Grade 5 Titanium Main Casing & Crown Winder */}
      <group position={[0, caseY, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.95, 0.95, 0.22, 64]} />
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.95}
            roughness={0.15}
            envMapIntensity={2.0}
          />
        </mesh>

        {/* Crown Winder Knob at 3 O'clock */}
        <mesh position={[0.98, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.12, 32]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* 6. Curved Stitched Luxury Bracelet Straps */}
      <group position={[0, strapY, 0]}>
        {/* Top Strap */}
        <mesh position={[0, 0, -1.35]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.62, 0.12, 0.95]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.1} />
        </mesh>
        {/* Bottom Strap */}
        <mesh position={[0, 0, 1.35]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.62, 0.12, 0.95]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.1} />
        </mesh>
      </group>

    </group>
  );
}

export default function Watch3DCanvas({
  selectedColor = 'obsidian',
  isExploded = false,
}: {
  selectedColor?: string;
  isExploded?: boolean;
}) {
  return (
    <div className="w-full h-[340px] sm:h-[450px] md:h-[550px] relative rounded-[32px] overflow-hidden flex items-center justify-center">
      {/* Ambient Canvas Lighting */}
      <Canvas
        camera={{ position: [0, 1.8, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 10, 7]} intensity={3.0} color="#ffffff" castShadow />
        <directionalLight position={[-5, -5, -5]} intensity={1.5} color="#38bdf8" />
        <pointLight position={[0, 3, 2]} intensity={2.0} color="#fbbf24" />

        {/* Ambient Drifting Luxury Particles */}
        <Sparkles count={40} scale={4} size={2.5} speed={0.4} color="#fbbf24" />

        <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.6}>
          <LuxuryWatchModel selectedColor={selectedColor} isExploded={isExploded} />
          <OrbitingGlowRings selectedColor={selectedColor} isExploded={isExploded} />
        </Float>

        {/* Soft Contact Shadow beneath Watch */}
        <ContactShadows
          position={[0, -1.2, 0]}
          opacity={0.6}
          scale={5}
          blur={2.5}
          far={4}
        />

        {/* Smooth User Rotation Control */}
        <OrbitControls
          enableZoom={false}
          autoRotate={!isExploded}
          autoRotateSpeed={1.2}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  );
}
