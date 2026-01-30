import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { Scene } from './components/World/Scene'
import { OverlayPanel } from './components/OverlayPanel'
import { AnalyticsHub } from './components/AnalyticsHub'
import { useDeployAnalytics } from './hooks/useDeployAnalytics'
import { STAGES } from './content/stages'

export default function App() {
  const analytics = useDeployAnalytics()
  const [selectedStage, setSelectedStage] = useState(null)
  const [showHub, setShowHub] = useState(false)
  const [visitedStages, setVisitedStages] = useState([])

  const handleStageSelect = (stage) => {
    setSelectedStage(stage)
    if (stage) {
      setVisitedStages((prev) => {
        if (prev.some((s) => s.id === stage.id)) return prev
        const next = [...prev, stage]
        return next.slice(0, STAGES.length)
      })
    }
  }

  const visitedCountUnique = Math.min(
    new Set(visitedStages?.map((s) => s.id) ?? []).size,
    STAGES.length
  )
  const hasCelebrated = useRef(false)

  useEffect(() => {
    if (visitedCountUnique < STAGES.length || hasCelebrated.current) return
    hasCelebrated.current = true
    const duration = 2500
    const end = Date.now() + duration
    const colors = ['#ffb7c5', '#ffd93d', '#6bcb77', '#7b68ee', '#f5f0e8']
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0.2 },
        colors,
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 0.8 },
        colors,
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [visitedCountUnique])

  return (
    <>
      {/* Top HUD: title + progress + achievement badges + Hub button */}
      <div className="hud" style={{ top: 0, left: 0, right: 0, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 auto', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
            Pipeline Shrine — CI/CD Learning Hub
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--sakura)', fontWeight: 600 }}>
            Learning path: {visitedCountUnique}/{STAGES.length} stages
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} title="Stage badges — click shrines to fill">
            {STAGES.map((stage) => {
              const visited = visitedStages?.some((s) => s.id === stage.id) ?? false
              return (
                <span
                  key={stage.id}
                  className="achievement-badge"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    background: visited ? 'var(--sakura)' : 'rgba(255,255,255,0.12)',
                    color: visited ? 'var(--ink)' : 'rgba(255,255,255,0.5)',
                    border: `2px solid ${visited ? 'var(--sakura-dim)' : 'rgba(255,255,255,0.25)'}`,
                    transition: 'background 0.2s, color 0.2s, border-color 0.2s',
                  }}
                >
                  {stage.icon}
                </span>
              )
            })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to="/architecture" className="primary" style={{ pointerEvents: 'auto', textDecoration: 'none', padding: '0.6rem 1rem' }}>
            Architecture
          </Link>
          <button
            type="button"
            className="primary"
            onClick={() => setShowHub(true)}
            style={{ pointerEvents: 'auto' }}
          >
            Analytics Hub
          </button>
        </div>
      </div>

      {/* 3D world */}
      <Scene
        onStageSelect={handleStageSelect}
        selectedId={selectedStage?.id}
      />

      {/* Overlay: learning panel when a shrine is clicked */}
      {selectedStage && !showHub && (
        <OverlayPanel stage={selectedStage} analytics={analytics} onClose={() => setSelectedStage(null)} />
      )}

      {/* Analytics Hub overlay */}
      {showHub && (
        <AnalyticsHub
          visitedStages={visitedStages}
          analytics={analytics}
          onClose={() => setShowHub(false)}
        />
      )}

      {/* Bottom hint */}
      <div className="hud" style={{ bottom: 0, left: 0, right: 0, padding: 12, textAlign: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
          Click a shrine to learn • Drag to rotate • Scroll to zoom
        </span>
      </div>
    </>
  )
}
