# Pipeline Shrine — CI/CD Learning Hub

[![Deploy](https://github.com/OWNER/REPO/actions/workflows/deploy.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/deploy.yml)

An anime-themed **3D learning app** for CI/CD: explore concepts by visiting shrines, view live pipeline metrics, and inspect the deployment architecture. Deploys to **GitHub Pages** via a path-filtered workflow with quality gates and Lighthouse CI.

> Replace `OWNER` and `REPO` in the badge with your GitHub username and repo name.

---

## App overview

| Feature | Description |
|--------|-------------|
| **3D world** | Night scene with five shrines (stages). Drag to rotate, scroll to zoom. |
| **Shrines** | Each shrine = one concept (Commit, Build, Test, Deploy, Monitor). Click to open a panel with live metrics. |
| **Analytics Hub** | Dashboard with pipeline metrics: last deploy, build time, commits today, repo stats, page load. |
| **Architecture** | `/architecture` — pipeline DAG, triggers, and quality gates, generated at build from the workflow. |

**Stack:** Vite, React, Three.js (React Three Fiber), Cytoscape.js (DAG).

![Pipeline Shrine — 3D hub](screenshots/Screenshot%202026-01-31%20at%2012.21.47%20AM.png)

*3D learning hub with shrines and cherry blossoms.*

![Shrine panel with live metrics](screenshots/Screenshot%202026-01-31%20at%2012.22.01%20AM.png)

*Click a shrine to see the concept and live metric.*

![Analytics Hub](screenshots/Screenshot%202026-01-31%20at%2012.22.31%20AM.png)

*Pipeline and repo metrics from version.json and GitHub API.*

![Architecture — pipeline DAG](screenshots/Screenshot%202026-01-31%20at%2012.22.49%20AM.png)

*Infrastructure visualization: DAG, triggers, quality gates.*

---

## CI/CD pipeline

- **Triggers:** `push` or `pull_request` to `main` when `index.html`, `src/**`, package files, or `scripts/**` change.
- **Quality gates:** HTML validation (W3C), link check (Lychee), `npm audit` (high/critical), Lighthouse CI. Deploy only if all pass.
- **Jobs:** validate → build → lighthouse → deploy (push only) → smoke-test (push only).
- **Other:** [availability-check.yml](.github/workflows/availability-check.yml) (scheduled + manual), [dependabot.yml](.github/dependabot.yml) (weekly dependency PRs). Optional: `DEPLOY_NOTIFY_WEBHOOK` for deploy notifications.

---

## Quick setup

1. **Create a repo** on GitHub and push this project to it (`main` branch).
2. **Enable Pages:** Settings → Pages → Source: **GitHub Actions**.
3. **Optional — branch protection:** Settings → Branches → Add rule for `main` → require status checks **Validate site** and **Lighthouse CI**.

Site URL: `https://<username>.github.io/<repo-name>/`

---

## Run locally

```bash
npm install
npm run dev
```

Build (generates `public/architecture.json` from the workflow and outputs to `dist/`):

```bash
npm run build
```

---

## Project layout

```
├── .github/workflows/   # deploy.yml, availability-check.yml
├── src/
│   ├── App.jsx, main.jsx
│   ├── components/      # World (3D), PipelineDag, AnalyticsHub, OverlayPanel
│   ├── pages/           # ArchitecturePage
│   ├── content/stages.js
│   └── hooks/useDeployAnalytics.js
├── scripts/             # generate-architecture.js, copy-404.js
├── public/              # models, architecture.json (build-time)
├── index.html, vite.config.js, lighthouserc.json
└── screenshots/         # Images for this README
```

---

## Resume / talking points

- **CI/CD:** Path-filtered deploy on push to `main`; quality gates (HTML, links, npm audit, Lighthouse) block deploy on failure.
- **Branch protection:** Required CI checks before merge to `main`.
- **Post-deploy:** Smoke test (HTTP 200 + critical content) and scheduled availability checks.
- **Infra viz:** Pipeline DAG and triggers generated at build from workflow config; documented in `/architecture`.
- **GitHub Actions:** checkout, configure-pages, upload-pages-artifact, deploy-pages; third-party validation/Lighthouse actions.

---

## License

MIT.
