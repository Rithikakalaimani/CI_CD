import { Canvas } from '@react-three/fiber'
import { OverlayScene3D } from './OverlayScene3D'

/**
 * Full-screen overlay with 3D Japanese-themed scene on the sides
 * and centered content (panel) in the middle. Used by OverlayPanel and AnalyticsHub.
 */
export function OverlayLayout({ children }) {
  return (
    <div
      className="hud"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 3D scene - full size, behind content; no pointer events */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          gl={{ alpha: true, antialias: true }}
          style={{ display: 'block' }}
        >
          <OverlayScene3D />
        </Canvas>
      </div>
      {/* Center content - panel on top */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          minHeight: '100%',
          padding: 24,
          pointerEvents: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  )
}
