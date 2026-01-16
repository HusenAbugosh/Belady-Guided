
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Box, Cylinder, Stars, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Fix: Manually declare intrinsic elements to satisfy TypeScript when R3F types are not automatically picked up
declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshPhysicalMaterial: any;
      lineSegments: any;
      edgesGeometry: any;
      lineBasicMaterial: any;
      group: any;
      ambientLight: any;
      pointLight: any;
      gridHelper: any;
      directionalLight: any;
      meshStandardMaterial: any;

      // HTML Elements
      div: any;
      span: any;
      p: any;
      a: any;
      img: any;
      h1: any;
      h2: any;
      h3: any;
      h4: any;
      h5: any;
      h6: any;
      ul: any;
      ol: any;
      li: any;
      nav: any;
      header: any;
      footer: any;
      main: any;
      section: any;
      button: any;
      br: any;
      strong: any;
      em: any;
      input: any;
      label: any;
      form: any;
    }
  }
}

// A stylized processor or cache bank unit
const Microchip = ({ position, rotation = [0, 0, 0], scale = 1, color = "#C5A059" }: { position: [number, number, number]; rotation?: [number, number, number]; scale?: number; color?: string }) => {
  return (
    <group position={position} rotation={rotation as [number, number, number]} scale={scale}>
      {/* Substrate (Base) */}
      <Box args={[2, 0.1, 2]}>
        <meshStandardMaterial color="#222" metalness={0.9} roughness={0.2} />
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(2, 0.1, 2)]} />
          <lineBasicMaterial color="#555" opacity={0.5} transparent />
        </lineSegments>
      </Box>

      {/* Die (The Silicon) */}
      <Box args={[1.2, 0.1, 1.2]} position={[0, 0.1, 0]}>
        <meshPhysicalMaterial 
            color="#111" 
            metalness={0.8} 
            roughness={0.2} 
            clearcoat={1}
            clearcoatRoughness={0.1}
        />
      </Box>

      {/* Accent/Gold Traces (Decorative Layer) */}
      <Box args={[1.3, 0.05, 1.3]} position={[0, 0.08, 0]}>
         <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </Box>

      {/* Pins / Circuit Detail */}
      <group position={[0, 0.05, 0]}>
         {/* Top Pins */}
         <Box args={[0.2, 0.05, 2.2]} position={[0, 0, 0]}><meshStandardMaterial color="#444" /></Box>
         <Box args={[2.2, 0.05, 0.2]} position={[0, 0, 0]}><meshStandardMaterial color="#444" /></Box>
      </group>
    </group>
  );
};

// Represents a 64-byte Cache Line moving through the system
const CacheLine = ({ position, speed = 1, delay = 0 }: { position: [number, number, number]; speed?: number, delay?: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime() * speed + delay;
      // Floating movement
      ref.current.position.y = position[1] + Math.sin(t) * 0.5;
      ref.current.position.z = position[2] + Math.cos(t * 0.5) * 0.2;
      // Gentle rotation
      ref.current.rotation.x = Math.sin(t * 0.2) * 0.1;
      ref.current.rotation.y += 0.01 * speed;
    }
  });

  return (
    <group position={position}>
        <Box ref={ref} args={[1.8, 0.05, 0.4]}>
            <meshPhysicalMaterial
                color="#C5A059"
                metalness={1}
                roughness={0.3}
                transparent
                opacity={0.8}
            />
            {/* Outline */}
            <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(1.8, 0.05, 0.4)]} />
                <lineBasicMaterial color="#fff" opacity={0.3} transparent />
            </lineSegments>
        </Box>
    </group>
  );
};

const InstructionStream = () => {
    const lines = useMemo(() => {
        const items = [];
        for(let i=0; i<20; i++) {
            items.push({
                position: [
                    (Math.random() - 0.5) * 15,
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 8 - 2 // Push slightly back
                ] as [number, number, number],
                speed: 0.2 + Math.random() * 0.5,
                delay: Math.random() * 10
            })
        }
        return items;
    }, []);

    return (
        <group>
            {lines.map((props, i) => <CacheLine key={i} {...props} />)}
        </group>
    )
}

export const HeroScene: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={40} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#C5A059" />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4a4a4a" />
        <directionalLight position={[0, 5, 5]} intensity={1} />
        
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
           {/* Main Central Architecture */}
           <group rotation={[0.4, -0.3, 0]}>
                {/* L2 Cache Bank / Main Chip */}
                <Microchip position={[0, 0, 0]} scale={1.2} />
                
                {/* L1 Cache / Satellite Chips */}
                <Microchip position={[-2.5, 1, -1]} scale={0.6} color="#888" rotation={[0.2, 0.5, -0.1]} />
                <Microchip position={[2.5, -1.2, 0.5]} scale={0.6} color="#888" rotation={[-0.2, -0.5, 0.1]} />
                
                {/* Background Chip */}
                <Microchip position={[1, 2, -3]} scale={0.8} color="#444" rotation={[0.5, 0, 0]} />
           </group>
        </Float>
        
        {/* Floating Data/Instructions */}
        <InstructionStream />

        <Environment preset="city" />
        {/* Abstract grid floor representing memory address space */}
        <gridHelper args={[40, 40, 0x333333, 0x111111]} position={[0, -4, 0]} rotation={[0, 0, 0]} />
      </Canvas>
    </div>
  );
};

export const HardwareScene: React.FC = () => {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas camera={{ position: [3, 4, 3], fov: 40 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
        <Environment preset="studio" />
        
        <Float rotationIntensity={0.1} floatIntensity={0.1} speed={1}>
          <group position={[0, 0, 0]}>
            {/* Processor Die */}
            <Box args={[3, 0.2, 3]} position={[0, 0, 0]}>
                <meshStandardMaterial color="#111" metalness={0.9} roughness={0.2} />
            </Box>
            
            {/* Cores */}
            <Box args={[0.8, 0.25, 0.8]} position={[-0.8, 0, -0.8]}>
                 <meshStandardMaterial color="#C5A059" metalness={1} roughness={0.3} />
            </Box>
            <Box args={[0.8, 0.25, 0.8]} position={[0.8, 0, -0.8]}>
                 <meshStandardMaterial color="#333" metalness={0.6} roughness={0.3} />
            </Box>
            <Box args={[0.8, 0.25, 0.8]} position={[-0.8, 0, 0.8]}>
                 <meshStandardMaterial color="#333" metalness={0.6} roughness={0.3} />
            </Box>
            <Box args={[0.8, 0.25, 0.8]} position={[0.8, 0, 0.8]}>
                 <meshStandardMaterial color="#333" metalness={0.6} roughness={0.3} />
            </Box>

            {/* Cache Lines / Interconnects */}
            <Cylinder args={[0.02, 0.02, 2.5]} rotation={[0, 0, Math.PI/2]} position={[0, 0.13, 0]}>
                <meshStandardMaterial color="#C5A059" emissive="#C5A059" emissiveIntensity={0.5} />
            </Cylinder>
             <Cylinder args={[0.02, 0.02, 2.5]} rotation={[Math.PI/2, 0, 0]} position={[0, 0.13, 0]}>
                <meshStandardMaterial color="#C5A059" emissive="#C5A059" emissiveIntensity={0.5} />
            </Cylinder>

          </group>
        </Float>
      </Canvas>
    </div>
  );
}
