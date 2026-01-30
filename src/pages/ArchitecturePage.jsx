import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PipelineDag } from '../components/PipelineDag'

const BASE = import.meta.env.BASE_URL || './'

export function ArchitecturePage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const url = `${BASE.replace(/\/$/, '')}/architecture.json`
    fetch(url, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load'))))
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="architecture-page">
        <div className="architecture-loading">Loading infrastructure config…</div>
      </div>
    )
  }
  if (error || !data) {
    return (
      <div className="architecture-page">
        <div className="architecture-panel" style={{ maxWidth: 480 }}>
          <h1>Infrastructure Visualization</h1>
          <p style={{ color: 'var(--danger)' }}>Could not load architecture: {error || 'No data'}</p>
          <p style={{ fontSize: '0.9rem', color: 'rgba(245,240,232,0.7)' }}>
            architecture.json is generated at build time from .github/workflows/deploy.yml.
          </p>
          <Link to="/" className="primary" style={{ display: 'inline-block', marginTop: 16 }}>
            Back to hub
          </Link>
        </div>
      </div>
    )
  }

  const { workflowFile, triggers, jobs, generatedAt } = data

  return (
    <div className="architecture-page" style={{ overflow: 'auto', minHeight: '100vh', height: '100%' }}>
      <div className="architecture-wrap">
        <header className="architecture-header">
          <h1>Infrastructure Visualization</h1>
          <p className="architecture-subtitle">
            CI/CD architecture and execution flow — generated at build from <code>{workflowFile}</code>
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link to="/" className="primary" style={{ textDecoration: 'none' }}>
              ← Back to hub
            </Link>
            <span style={{ fontSize: '0.75rem', color: 'rgba(245,240,232,0.5)' }}>
              Generated {generatedAt ? new Date(generatedAt).toLocaleString() : '—'}
            </span>
          </div>
        </header>

        <section className="architecture-section">
          <h2>Pipeline DAG</h2>
          <p className="section-desc">Jobs and dependencies (needs). Arrows show execution order; deploy runs only after validate, build, and lighthouse succeed.</p>
          <PipelineDag jobs={jobs} height={420} />
        </section>

        <section className="architecture-section">
          <h2>Trigger conditions</h2>
          <p className="section-desc">When the workflow runs.</p>
          <div className="triggers-grid">
            {triggers.map((t) => (
              <div key={t.event} className="architecture-card">
                <div className="card-label">{t.description}</div>
                <div className="card-value">{t.event}</div>
                <div className="card-meta">Branches: {t.branches.join(', ')}</div>
                {t.paths && t.paths.length && (
                  <div className="card-meta">Paths: {t.paths.slice(0, 4).join(', ')}{t.paths.length > 4 ? '…' : ''}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="architecture-section">
          <h2>Quality gates</h2>
          <p className="section-desc">Checks that must pass; failure blocks deployment.</p>
          <div className="gates-list">
            {jobs.filter((j) => j.qualityGates?.length).map((job) => (
              <div key={job.id} className="gate-job">
                <div className="gate-job-name">{job.name}</div>
                <ul>
                  {job.qualityGates.map((g, i) => (
                    <li key={i}>
                      <span className={`gate-type gate-type-${g.type}`}>{g.type}</span> {g.name}
                      {g.blocksDeploy && <span className="gate-blocks"> blocks deploy</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        .architecture-page {
          min-height: 100vh;
          background: var(--sky-deep);
          color: var(--paper);
          padding: 24px 16px;
        }
        .architecture-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          color: var(--sakura);
        }
        .architecture-wrap {
          max-width: 900px;
          margin: 0 auto;
        }
        .architecture-header {
          margin-bottom: 32px;
        }
        .architecture-header h1 {
          font-size: 1.5rem;
          color: var(--sakura);
          margin-bottom: 4px;
        }
        .architecture-subtitle {
          font-size: 0.9rem;
          color: rgba(245,240,232,0.7);
          margin-bottom: 12px;
        }
        .architecture-subtitle code {
          background: rgba(0,0,0,0.3);
          padding: 2px 6px;
          border-radius: 4px;
        }
        .architecture-section {
          margin-bottom: 36px;
        }
        .architecture-section h2 {
          font-size: 1.1rem;
          color: var(--sakura);
          margin-bottom: 4px;
        }
        .section-desc {
          font-size: 0.85rem;
          color: rgba(245,240,232,0.6);
          margin-bottom: 16px;
        }
        .triggers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
        }
        .architecture-card {
          background: rgba(0,0,0,0.25);
          border-radius: 10px;
          padding: 14px;
          border-left: 3px solid var(--success);
        }
        .card-label { font-size: 0.75rem; color: rgba(245,240,232,0.7); }
        .card-value { font-weight: 700; color: var(--paper); margin: 4px 0; }
        .card-meta { font-size: 0.8rem; color: rgba(245,240,232,0.6); }
        .gates-list { display: flex; flex-direction: column; gap: 16px; }
        .gate-job { background: rgba(0,0,0,0.25); border-radius: 10px; padding: 14px; border-left: 3px solid var(--accent); }
        .gate-job-name { font-weight: 700; color: var(--paper); margin-bottom: 8px; }
        .gate-job ul { margin: 0; padding-left: 20px; font-size: 0.9rem; }
        .gate-type { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; margin-right: 6px; }
        .gate-type-validation { background: rgba(123,104,238,0.3); color: #b8b0ff; }
        .gate-type-security { background: rgba(255,107,107,0.2); color: #ffb3b3; }
        .gate-type-build { background: rgba(255,215,61,0.2); color: #ffe066; }
        .gate-type-quality { background: rgba(107,203,119,0.2); color: #8ee099; }
        .gate-type-smoke { background: rgba(255,183,197,0.2); color: var(--sakura); }
        .gate-blocks { font-size: 0.8rem; color: rgba(245,240,232,0.6); }
      `}</style>
    </div>
  )
}
