export function OverlayPanel({ stage, analytics, onClose }) {
  if (!stage) return null

  const { title, subtitle, icon, body, metric, metricKey } = stage
  const value =
    analytics?.formatted && metricKey
      ? analytics.formatted[metricKey]
      : analytics?.loading
        ? 'Loading…'
        : '—'

  return (
    <div className="hud" style={{ inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div
        className="panel"
        style={{
          maxWidth: 420,
          width: '100%',
          animation: 'panelIn 0.3s ease-out',
        }}
      >
        <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.5rem' }}>{icon}</span>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,183,197,0.8)', marginBottom: 12 }}>
            {subtitle}
          </div>
        )}
        <div className="panel-body" style={{ marginBottom: 16 }}>
          {body}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: '0.85rem', color: 'rgba(245,240,232,0.7)' }}>
            <strong style={{ color: 'var(--sakura)' }}>{metric}:</strong> {value}
          </div>
          <button type="button" className="primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <style>{`
        @keyframes panelIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
