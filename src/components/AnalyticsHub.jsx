import { STAGES } from '../content/stages'

function formatMetric(analytics, key) {
  if (!analytics?.formatted) return '—'
  return analytics.formatted[key] ?? '—'
}

export function AnalyticsHub({ visitedStages, analytics, onClose }) {
  const visitedCount = visitedStages?.length ?? 0

  const metrics = [
    { label: 'Commits today', value: formatMetric(analytics, 'commitsToday'), status: 'ok' },
    { label: 'Last deploy', value: formatMetric(analytics, 'lastDeploy'), status: 'ok' },
    { label: 'Build time', value: formatMetric(analytics, 'buildTime'), status: 'ok' },
    { label: 'Tests passed', value: formatMetric(analytics, 'testsPassed'), status: 'ok' },
    { label: 'Commit SHA', value: formatMetric(analytics, 'commitSha'), status: 'ok' },
    { label: 'Pipeline health', value: formatMetric(analytics, 'pipelineHealth'), status: 'ok' },
    { label: 'Stages visited', value: `${visitedCount} / ${STAGES.length}`, status: 'info' },
  ]

  return (
    <div className="hud" style={{ inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div
        className="panel"
        style={{
          maxWidth: 520,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          animation: 'panelIn 0.3s ease-out',
        }}
      >
        <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          {/* <span style={{ fontSize: '1.5rem' }}></span> */}
          Analytics Hub
        </div>
        <div style={{ fontSize: '0.85rem', color: 'rgba(245,240,232,0.8)', marginBottom: 20 }}>
          Live pipeline metrics from version.json and GitHub API. 
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {metrics.map((m) => (
            <div
              key={m.label}
              style={{
                padding: '12px 14px',
                background: 'rgba(0,0,0,0.25)',
                borderRadius: 10,
                borderLeft: `3px solid ${m.status === 'ok' ? 'var(--success)' : 'var(--accent)'}`,
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'rgba(245,240,232,0.7)' }}>{m.label}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--paper)' }}>{m.value}</div>
            </div>
          ))}
        </div>
        {analytics?.deployedAt && (
          <div style={{ fontSize: '0.8rem', color: 'rgba(245,240,232,0.7)', marginBottom: 12 }}>
            Deployed at: {analytics.formatted?.deployDate ?? '—'}
          </div>
        )}
        <div style={{ marginBottom: 12, fontSize: '0.9rem' }}>
          <strong style={{ color: 'var(--sakura)' }}>Stages discovered:</strong>{' '}
          {visitedStages?.length ? visitedStages.map((s) => s.title).join(' → ') : 'Click shrines in the world to learn.'}
        </div>
        <button type="button" className="primary" onClick={onClose}>
          Back to world
        </button>
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
