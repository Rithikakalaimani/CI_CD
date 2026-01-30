import { STAGES } from '../content/stages'

function formatMetric(analytics, key) {
  if (!analytics?.formatted) return '—'
  return analytics.formatted[key] ?? '—'
}

export function AnalyticsHub({ visitedStages, analytics, onClose }) {
  const visitedCount = Math.min(
    new Set(visitedStages?.map((s) => s.id) ?? []).size,
    STAGES.length
  )
  const allCompleted = visitedCount >= STAGES.length

  const pipelineMetrics = [
    { label: 'Last deploy', value: formatMetric(analytics, 'lastDeploy'), status: 'ok' },
    { label: 'Build time', value: formatMetric(analytics, 'buildTime'), status: 'ok' },
    { label: 'Tests passed', value: formatMetric(analytics, 'testsPassed'), status: 'ok' },
    { label: 'Commit SHA', value: formatMetric(analytics, 'commitSha'), status: 'ok' },
    { label: 'Pipeline health', value: formatMetric(analytics, 'pipelineHealth'), status: 'ok' },
  ]
  const repoMetrics = [
    { label: 'Commits today', value: formatMetric(analytics, 'commitsToday'), status: 'ok' },
    { label: 'Commits this week', value: formatMetric(analytics, 'commitsThisWeek'), status: 'ok' },
    { label: 'Last commit', value: formatMetric(analytics, 'lastCommitMessage'), status: 'ok', wide: true },
    { label: 'Stars', value: formatMetric(analytics, 'repoStars'), status: 'ok' },
    { label: 'Forks', value: formatMetric(analytics, 'repoForks'), status: 'ok' },
    { label: 'Default branch', value: formatMetric(analytics, 'defaultBranch'), status: 'ok' },
    { label: 'Open issues', value: formatMetric(analytics, 'openIssues'), status: 'ok' },
  ]
  const clientMetrics = [
    { label: 'Stages visited', value: `${visitedCount} / ${STAGES.length}`, status: 'info' },
    { label: 'Page load', value: formatMetric(analytics, 'pageLoadMs'), status: 'ok' },
  ]

  function MetricCard({ label, value, status, wide }) {
    return (
      <div
        style={{
          padding: '12px 14px',
          background: 'rgba(0,0,0,0.25)',
          borderRadius: 10,
          borderLeft: `3px solid ${status === 'ok' ? 'var(--success)' : 'var(--accent)'}`,
          gridColumn: wide ? '1 / -1' : undefined,
        }}
      >
        <div style={{ fontSize: '0.75rem', color: 'rgba(245,240,232,0.7)' }}>{label}</div>
        <div style={{ fontSize: wide ? '0.9rem' : '1.1rem', fontWeight: 700, color: 'var(--paper)', wordBreak: 'break-word' }}>{value}</div>
      </div>
    )
  }

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
          Analytics Hub
        </div>
        <div style={{ fontSize: '0.85rem', color: 'rgba(245,240,232,0.8)', marginBottom: 20 }}>
          Live pipeline metrics from version.json and GitHub API.
        </div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sakura)', marginBottom: 8 }}>Pipeline</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {pipelineMetrics.map((m) => (
            <MetricCard key={m.label} label={m.label} value={m.value} status={m.status} />
          ))}
        </div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sakura)', marginBottom: 8 }}>Repo (GitHub)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {repoMetrics.map((m) => (
            <MetricCard key={m.label} label={m.label} value={m.value} status={m.status} wide={m.wide} />
          ))}
        </div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sakura)', marginBottom: 8 }}>Client</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {clientMetrics.map((m) => (
            <MetricCard key={m.label} label={m.label} value={m.value} status={m.status} />
          ))}
        </div>
        {analytics?.deployedAt && (
          <div style={{ fontSize: '0.8rem', color: 'rgba(245,240,232,0.7)', marginBottom: 12 }}>
            Deployed at: {analytics.formatted?.deployDate ?? '—'}
          </div>
        )}
        {allCompleted && (
          <div
            className="panel"
            style={{
              marginBottom: 16,
              padding: 16,
              borderColor: 'var(--success)',
              background: 'rgba(107, 203, 119, 0.1)',
            }}
          >
            <div className="panel-title" style={{ color: 'var(--success)' }}>
              You've completed all stages
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(245,240,232,0.9)', marginTop: 4 }}>
              You've visited all {STAGES.length} shrines.
            </div>
          </div>
        )}
        <div style={{ marginBottom: 12, fontSize: '0.9rem' }}>
          <strong style={{ color: 'var(--sakura)' }}>Stages discovered:</strong>{' '}
          {visitedStages?.length
            ? [...new Map(visitedStages.map((s) => [s.id, s])).values()].slice(0, STAGES.length).map((s) => s.title).join(' → ')
            : 'Click shrines in the world to learn.'}
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
