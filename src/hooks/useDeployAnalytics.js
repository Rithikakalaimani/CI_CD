import { useState, useEffect } from 'react'

const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || ''

function formatDuration(seconds) {
  if (seconds == null) return '—'
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s ? `${m}m ${s}s` : `${m}m`
}

function formatRelativeTime(isoString) {
  if (!isoString) return '—'
  const date = new Date(isoString)
  const now = new Date()
  const sec = Math.floor((now - date) / 1000)
  if (sec < 60) return 'Just now'
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function fetchVersionJson() {
  const base = import.meta.env.BASE_URL || './'
  const url = `${base.replace(/\/$/, '')}/version.json`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

async function fetchCommitsToday(repo) {
  if (!repo || repo.split('/').length !== 2) return null
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const since = today.toISOString()
  const url = `https://api.github.com/repos/${repo}/commits?since=${since}&per_page=100`
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return Array.isArray(data) ? data.length : null
  } catch {
    return null
  }
}

export function useDeployAnalytics() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    deployedAt: null,
    sha: null,
    shortSha: null,
    buildDurationSeconds: null,
    checksPassed: null,
    commitsToday: null,
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [version, commitsToday] = await Promise.all([
          fetchVersionJson(),
          GITHUB_REPO ? fetchCommitsToday(GITHUB_REPO) : Promise.resolve(null),
        ])

        if (cancelled) return

        if (version) {
          setState((prev) => ({
            ...prev,
            loading: false,
            deployedAt: version.deployedAt ?? null,
            sha: version.sha ?? null,
            shortSha: version.shortSha ?? null,
            buildDurationSeconds: version.buildDurationSeconds ?? null,
            checksPassed: version.checksPassed ?? null,
            commitsToday: commitsToday ?? version.commitsToday ?? null,
          }))
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            commitsToday: commitsToday ?? null,
          }))
        }
      } catch (err) {
        if (!cancelled) {
          setState((prev) => ({ ...prev, loading: false, error: err.message }))
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const formatted = {
    lastDeploy: formatRelativeTime(state.deployedAt),
    deployDate: state.deployedAt
      ? new Date(state.deployedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
      : '—',
    buildTime: formatDuration(state.buildDurationSeconds),
    testsPassed: state.checksPassed != null ? `${state.checksPassed}/${state.checksPassed}` : '—',
    commitSha: state.shortSha || state.sha?.slice(0, 7) || '—',
    commitsToday: state.commitsToday != null ? String(state.commitsToday) : '—',
    pipelineHealth: state.deployedAt ? '100%' : '—',
  }

  return { ...state, formatted }
}
