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

function repoOk(repo) {
  return repo && repo.split('/').length === 2
}

async function fetchCommitsToday(repo) {
  if (!repoOk(repo)) return null
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

async function fetchRepoInfo(repo) {
  if (!repoOk(repo)) return null
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return {
      stars: data.stargazers_count,
      forks: data.forks_count,
      defaultBranch: data.default_branch,
      openIssues: data.open_issues_count,
    }
  } catch {
    return null
  }
}

async function fetchCommitsThisWeekAndLast(repo) {
  if (!repoOk(repo)) return { count: null, lastMessage: null }
  const since = new Date()
  since.setDate(since.getDate() - 7)
  const url = `https://api.github.com/repos/${repo}/commits?since=${since.toISOString()}&per_page=100`
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return { count: null, lastMessage: null }
    const data = await res.json()
    if (!Array.isArray(data)) return { count: null, lastMessage: null }
    const last = data[0]
    const message = last?.commit?.message
      ? last.commit.message.split('\n')[0].slice(0, 60) + (last.commit.message.length > 60 ? '…' : '')
      : null
    return { count: data.length, lastMessage: message }
  } catch {
    return { count: null, lastMessage: null }
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
    repoStars: null,
    repoForks: null,
    defaultBranch: null,
    openIssues: null,
    commitsThisWeek: null,
    lastCommitMessage: null,
    loadTimeMs: null,
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      const loadStart = performance.now()
      try {
        const [version, commitsToday, repoInfo, commitsWeek] = await Promise.all([
          fetchVersionJson(),
          GITHUB_REPO ? fetchCommitsToday(GITHUB_REPO) : Promise.resolve(null),
          GITHUB_REPO ? fetchRepoInfo(GITHUB_REPO) : Promise.resolve(null),
          GITHUB_REPO ? fetchCommitsThisWeekAndLast(GITHUB_REPO) : Promise.resolve({ count: null, lastMessage: null }),
        ])
        const loadTimeMs = Math.round(performance.now() - loadStart)

        if (cancelled) return

        const next = {
          ...state,
          loading: false,
          loadTimeMs,
          commitsToday: commitsToday ?? version?.commitsToday ?? null,
          repoStars: repoInfo?.stars ?? null,
          repoForks: repoInfo?.forks ?? null,
          defaultBranch: repoInfo?.defaultBranch ?? null,
          openIssues: repoInfo?.openIssues ?? null,
          commitsThisWeek: commitsWeek?.count ?? null,
          lastCommitMessage: commitsWeek?.lastMessage ?? null,
        }
        if (version) {
          next.deployedAt = version.deployedAt ?? null
          next.sha = version.sha ?? null
          next.shortSha = version.shortSha ?? null
          next.buildDurationSeconds = version.buildDurationSeconds ?? null
          next.checksPassed = version.checksPassed ?? null
        }
        setState(next)
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
    repoStars: state.repoStars != null ? String(state.repoStars) : '—',
    repoForks: state.repoForks != null ? String(state.repoForks) : '—',
    defaultBranch: state.defaultBranch || '—',
    openIssues: state.openIssues != null ? String(state.openIssues) : '—',
    commitsThisWeek: state.commitsThisWeek != null ? String(state.commitsThisWeek) : '—',
    lastCommitMessage: state.lastCommitMessage || '—',
    pageLoadMs: state.loadTimeMs != null ? (state.loadTimeMs < 1000 ? `${state.loadTimeMs}ms` : `${(state.loadTimeMs / 1000).toFixed(1)}s`) : '—',
  }

  return { ...state, formatted }
}
