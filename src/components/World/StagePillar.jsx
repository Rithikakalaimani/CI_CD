import { Float, Text, RoundedBox } from '@react-three/drei'

export function StagePillar({ stage, isSelected, onClick }) {
  const { position, title, icon } = stage

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
        <group onClick={onClick} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = 'default' }}>
          {/* Pillar / torii-style base */}
          <RoundedBox
            args={[1.4, 1.2, 0.6]}
            radius={0.08}
            smoothness={4}
            position={[0, 0.6, 0]}
          >
            <meshStandardMaterial
              color={isSelected ? '#ffb7c5' : '#2d2640'}
              emissive={isSelected ? '#ffb7c5' : '#000'}
              emissiveIntensity={isSelected ? 0.15 : 0}
              roughness={0.7}
              metalness={0.2}
            />
          </RoundedBox>
          {/* Icon / label above */}
          <Text
            position={[0, 1.35, 0]}
            fontSize={0.4}
            color={isSelected ? '#ffd93d' : '#f5f0e8'}
            anchorX="center"
            anchorY="middle"
          >
            {icon}
          </Text>
          <Text
            position={[0, 0.85, 0.6]}
            fontSize={0.14}
            maxWidth={1.2}
            textAlign="center"
            color="rgba(245,240,232,0.9)"
            anchorX="center"
            anchorY="middle"
          >
            {title}
          </Text>
        </group>
      </Float>
    </group>
  )
}
