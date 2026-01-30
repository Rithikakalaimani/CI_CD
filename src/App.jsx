import { useState } from 'react'
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
    if (stage && !visitedStages.find((s) => s.id === stage.id)) {
      setVisitedStages((prev) => [...prev, stage])
    }
  }

  return (
    <>
      {/* Top HUD: title + Hub button */}
      <div className="hud" style={{ top: 0, left: 0, right: 0, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
          Pipeline Shrine — CI/CD Learning Hub
        </div>
        <button
          type="button"
          className="primary"
          onClick={() => setShowHub(true)}
          style={{ pointerEvents: 'auto' }}
        >
          Analytics Hub
        </button>
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
