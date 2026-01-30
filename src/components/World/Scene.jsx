import { Canvas } from '@react-three/fiber'
import { Float, Text, Stars, OrbitControls } from '@react-three/drei'
import { StagePillar } from './StagePillar'
import { STAGES } from '../../content/stages'

export function Scene({ onStageSelect, selectedId }) {
  return (
    <Canvas
      camera={{ position: [0, 4, 10], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={['#0d0a1a']} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <pointLight position={[0, 3, 2]} color="#ffb7c5" intensity={0.8} distance={15} />
      <pointLight position={[-3, 2, 3]} color="#ffd93d" intensity={0.5} distance={12} />
      <pointLight position={[3, 2, 3]} color="#7b68ee" intensity={0.5} distance={12} />

      {/* Anime night sky feel */}
      <Stars radius={80} depth={50} count={2000} factor={4} saturation={0.6} fade speed={1} />

      {/* Ground plane — dark stone / dojo floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1535" roughness={0.9} metalness={0.1} />
      </mesh>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={4}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2 - 0.1}
      />

      {/* Stage pillars / shrines */}
      {STAGES.map((stage) => (
        <StagePillar
          key={stage.id}
          stage={stage}
          isSelected={selectedId === stage.id}
          onClick={() => onStageSelect(stage)}
        />
      ))}

      {/* Title in world */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <Text
          position={[0, 5.5, 0]}
          fontSize={0.5}
          color="#ffb7c5"
          anchorX="center"
          anchorY="middle"
        >
          Pipeline Shrine
        </Text>
        <Text
          position={[0, 4.9, 0]}
          fontSize={0.22}
          color="rgba(255,255,255,0.6)"
          anchorX="center"
          anchorY="middle"
        >
          CI/CD Learning Hub — Click a shrine to learn
        </Text>
      </Float>
    </Canvas>
  )
}
