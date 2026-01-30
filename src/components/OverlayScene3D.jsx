import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Float } from '@react-three/drei'

// Left side: street buildings + convenience store + bike
function LeftSideScene() {
  const group = useRef()
  useFrame((state) => {
    if (group.current) group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.05
  })
  return (
    <group ref={group} position={[-3.5, 0, -2]}>
      {/* Building blocks - different heights */}
      <RoundedBox args={[1.2, 1.8, 0.8]} radius={0.05} position={[-1.5, 0.9, 0]}>
        <meshStandardMaterial color="#2d2640" roughness={0.8} metalness={0.1} />
      </RoundedBox>
      <RoundedBox args={[1, 1.2, 0.7]} radius={0.05} position={[-0.5, 0.6, 0.1]}>
        <meshStandardMaterial color="#1a1535" roughness={0.8} metalness={0.1} />
      </RoundedBox>
      {/* Convenience store - wider with sign */}
      <group position={[0.6, 0, 0]}>
        <RoundedBox args={[1.4, 1.4, 0.9]} radius={0.06} position={[0, 0.7, 0]}>
          <meshStandardMaterial color="#3d3550" roughness={0.7} metalness={0.15} />
        </RoundedBox>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[1.1, 0.15, 0.1]} />
          <meshStandardMaterial color="#ffd93d" emissive="#ffd93d" emissiveIntensity={0.3} />
        </mesh>
      </group>
      {/* Simple bike - wheels + frame */}
      <group position={[1.8, 0.35, 0]} rotation={[0, 0, Math.PI / 12]}>
        <mesh position={[-0.25, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
          <meshStandardMaterial color="#333" roughness={0.6} />
        </mesh>
        <mesh position={[0.25, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
          <meshStandardMaterial color="#333" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.5, 0.08, 0.05]} />
          <meshStandardMaterial color="#c41e3a" roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

// Right side: pagoda, torii, lantern
function RightSideScene() {
  const group = useRef()
  useFrame((state) => {
    if (group.current) group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.12 + 1) * 0.05
  })
  return (
    <group ref={group} position={[3.5, 0, -2]}>
      {/* Pagoda - stacked tiers */}
      <group position={[0, 0, 0.2]}>
        <RoundedBox args={[0.9, 0.5, 0.9]} radius={0.04} position={[0, 0.25, 0]}>
          <meshStandardMaterial color="#8b4513" roughness={0.8} metalness={0.1} />
        </RoundedBox>
        <RoundedBox args={[0.75, 0.45, 0.75]} radius={0.04} position={[0, 0.725, 0]}>
          <meshStandardMaterial color="#a0522d" roughness={0.8} metalness={0.1} />
        </RoundedBox>
        <RoundedBox args={[0.6, 0.4, 0.6]} radius={0.04} position={[0, 1.1, 0]}>
          <meshStandardMaterial color="#8b4513" roughness={0.8} metalness={0.1} />
        </RoundedBox>
        <RoundedBox args={[0.45, 0.35, 0.45]} radius={0.04} position={[0, 1.425, 0]}>
          <meshStandardMaterial color="#c41e3a" roughness={0.7} metalness={0.2} />
        </RoundedBox>
      </group>
      {/* Torii gate */}
      <group position={[-1.2, 0.5, 0]}>
        <mesh position={[-0.35, 0.5, 0]}>
          <boxGeometry args={[0.12, 1, 0.12]} />
          <meshStandardMaterial color="#c41e3a" roughness={0.6} metalness={0.1} />
        </mesh>
        <mesh position={[0.35, 0.5, 0]}>
          <boxGeometry args={[0.12, 1, 0.12]} />
          <meshStandardMaterial color="#c41e3a" roughness={0.6} metalness={0.1} />
        </mesh>
        <mesh position={[0, 1.05, 0]}>
          <boxGeometry args={[0.9, 0.15, 0.15]} />
          <meshStandardMaterial color="#c41e3a" roughness={0.6} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.6, 0.1, 0.12]} />
          <meshStandardMaterial color="#8b4513" roughness={0.8} />
        </mesh>
      </group>
      {/* Lantern */}
      <Float speed={1.5} floatIntensity={0.2} rotationIntensity={0.1}>
        <group position={[1.2, 0.8, 0]}>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.15, 0.18, 0.35, 8]} />
            <meshStandardMaterial color="#ffd93d" emissive="#ffd93d" emissiveIntensity={0.4} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <meshStandardMaterial color="#2d2640" roughness={0.8} />
          </mesh>
        </group>
      </Float>
    </group>
  )
}

export function OverlayScene3D() {
  return (
    <>
      <color attach="background" args={['#0d0a1a']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-2, 2, 2]} color="#ffb7c5" intensity={0.4} distance={10} />
      <pointLight position={[2, 2, 2]} color="#ffd93d" intensity={0.4} distance={10} />
      <LeftSideScene />
      <RightSideScene />
    </>
  )
}
