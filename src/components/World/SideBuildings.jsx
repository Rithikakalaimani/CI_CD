import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'

const BASE = import.meta.env.BASE_URL || './'
const MODELS = {
  shop: `${BASE}models/dagashiya_shop_japanese_old_snack_shop.glb`,
  cherry: `${BASE}models/japanese_cherry_tree.glb`,
}

function GlbModel({ url, position, scale = 1, rotation = [0, 0, 0] }) {
  const { scene } = useGLTF(url)
  const cloned = useMemo(() => scene.clone(), [scene])
  return (
    <primitive
      object={cloned}
      position={position}
      scale={Array.isArray(scale) ? scale : [scale, scale, scale]}
      rotation={rotation}
    />
  )
}

export function SideBuildings() {
  return (
    <group>
      {/* Left side — trees only (no building) */}
     
      <GlbModel url={MODELS.cherry} position={[-7, 0, 3.5]} scale={0.35} rotation={[0, 0.4, 0]} />

      {/* Right side — teashop + trees, smaller scale so overlay stays clear */}
      <GlbModel url={MODELS.shop} position={[7.5, 0, 0.5]} scale={0.5} rotation={[0, -Math.PI / 2, 0]} />
      <GlbModel url={MODELS.cherry} position={[6.5, 0, -6]} scale={0.4} rotation={[0, -0.3, 0]} />
     
    </group>
  )
}

export function preloadSideBuildings() {
  useGLTF.preload(MODELS.shop)
  useGLTF.preload(MODELS.cherry)
}
