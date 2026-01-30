import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 180
const FALL_SPEED = 0.15
const SWAY_AMPLITUDE = 1.2
const SWAY_FREQ = 0.4
const RESET_HEIGHT = 12

export function CherryBlossoms() {
  const pointsRef = useRef(null)

  const [positions, speeds, offsets] = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    const spd = new Float32Array(COUNT)
    const off = new Float32Array(COUNT * 2)
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 24
      pos[i * 3 + 1] = Math.random() * 14
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20
      spd[i] = FALL_SPEED * (0.6 + Math.random() * 0.8)
      off[i * 2 + 0] = Math.random() * Math.PI * 2
      off[i * 2 + 1] = Math.random() * 100
    }
    return [pos, spd, off]
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    const posAttr = pointsRef.current.geometry.attributes.position
    const t = state.clock.elapsedTime
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3
      let y = posAttr.array[i3 + 1]
      y -= speeds[i] * 0.016
      if (y < -2) y = RESET_HEIGHT
      posAttr.array[i3 + 1] = y
      posAttr.array[i3 + 0] += Math.sin(t * SWAY_FREQ + offsets[i * 2 + 0]) * 0.008
      posAttr.array[i3 + 2] += Math.cos(t * SWAY_FREQ * 0.7 + offsets[i * 2 + 1] * 0.01) * 0.008
    }
    posAttr.needsUpdate = true
  })

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={0.25}
        color="#ffb7c5"
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  )
}
