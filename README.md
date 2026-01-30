# Pipeline Shrine — CI/CD Learning Hub


An anime-themed **3D learning app** for CI/CD: explore concepts by visiting shrines, view live pipeline metrics, and inspect the deployment architecture. Deploys to **GitHub Pages** via a path-filtered workflow with quality gates and Lighthouse CI.

> Link :** [https://rithikakalaimani.github.io/CI_CD/](https://rithikakalaimani.github.io/CI_CD/)

---

## App overview

| Feature | Description |
|--------|-------------|
| **3D world** | Night scene with five shrines (stages). Drag to rotate, scroll to zoom. |
| **Shrines** | Each shrine = one concept (Commit, Build, Test, Deploy, Monitor). Click to open a panel with live metrics. |
| **Analytics Hub** | Dashboard with pipeline metrics: last deploy, build time, commits today, repo stats, page load. |
| **Architecture** | `/architecture` — pipeline DAG, triggers, and quality gates, generated at build from the workflow. |

**Stack:** Vite, React, Three.js , Cytoscape.js (DAG).

![3d](https://github.com/Rithikakalaimani/CI_CD/blob/main/screenshots/Screenshot%202026-01-31%20at%2012.21.47%E2%80%AFAM.png)

![shrine](https://github.com/Rithikakalaimani/CI_CD/blob/main/screenshots/Screenshot%202026-01-31%20at%2012.22.01%E2%80%AFAM.png)

![ana](https://github.com/Rithikakalaimani/CI_CD/blob/main/screenshots/Screenshot%202026-01-31%20at%2012.22.31%E2%80%AFAM.png)

![archi](https://github.com/Rithikakalaimani/CI_CD/blob/main/screenshots/Screenshot%202026-01-31%20at%2012.22.49%E2%80%AFAM.png)

---

## CI/CD pipeline — what’s implemented

### Triggers

The main workflow ([`deploy.yml`](.github/workflows/deploy.yml)) runs only when relevant files change, so you don’t waste runs on README-only commits.

- **Events:** `push` to `main` and `pull_request` targeting `main`.
- **Path filters:** The workflow runs only if at least one of these changed:
  - `index.html`
  - `lighthouserc.json`
  - `package.json`, `package-lock.json`
  - `src/**`
  - `scripts/**`
  - `vite.config.js`
- **Concurrency:** One deploy at a time per ref (`pages-${{ github.ref }}`), with `cancel-in-progress: false` so the latest run completes.

### Quality gates (all must pass before deploy)

| Gate | Where | What it does |
|------|--------|---------------|
| **HTML validation** | validate job | Sends `index.html` to W3C Nu Validator (validator.nu). Fails the job on any reported error. |
| **Link check** | validate job | [Lychee](https://github.com/lycheeverse/lychee-action) checks links in `index.html`. Fails if any link is broken. |
| **npm audit** | build job | `npm audit --audit-level=high`. Fails if high or critical vulnerabilities exist; blocks build and deploy. |
| **Lighthouse CI** | lighthouse job | Runs [Lighthouse CI](https://github.com/treosh/lighthouse-ci-action) against the built site using [lighthouserc.json](lighthouserc.json). Asserts performance, accessibility, best practices, SEO. Reports are uploaded as workflow artifacts and to temporary public storage. |

If any of these fail, the pipeline stops and **deploy does not run**.

### Jobs and flow

1. **validate** — Checkout → W3C HTML validation → Lychee link check. No dependencies.
2. **build** — Checkout → Node 20 + npm cache → `npm ci` → `npm audit` → `npm run build` → write `version.json` (deployedAt, sha, shortSha, buildDurationSeconds, checksPassed) into `dist/` → upload `dist/` as the Pages artifact. Exposes `VITE_GITHUB_REPO` so the app can show “Commits today” from the GitHub API.
3. **lighthouse** — Depends on **build**. Checkout → install → build → run Lighthouse CI against `dist/`.
4. **deploy** — Depends on **validate**, **build**, and **lighthouse**. Runs only on `push` to `main`. Uses `actions/configure-pages` and `actions/deploy-pages` to publish the artifact to GitHub Pages. Optional: if `DEPLOY_NOTIFY_WEBHOOK` secret is set, sends a POST (e.g. Slack/Discord) on success.
5. **smoke-test** — Depends on **deploy**. Runs only on `push` to `main`. Waits 45s, then curls the live site: asserts HTTP 200 and that the response body contains “Pipeline Shrine”.

On **pull_request**, only validate, build, and lighthouse run; deploy and smoke-test are skipped.

### Deployment metadata

The build job writes `version.json` into `dist/` with: `deployedAt`, `sha`, `shortSha`, `buildDurationSeconds`, `checksPassed`. The deployed app fetches this and shows “Last deploy”, “Build time”, “Commit SHA”, “Pipeline health” in the Analytics Hub and shrine panels.

### Other workflows and automation

- **[availability-check.yml](.github/workflows/availability-check.yml)** — Runs on a schedule (every 6 hours) and via **Run workflow**. Single job: curl the live GitHub Pages URL and fail if the response is not HTTP 200. Used to monitor that the site is up.
- **[dependabot.yml](.github/dependabot.yml)** — Weekly dependency updates: **npm** (up to 5 open PRs) and **GitHub Actions** (up to 3 open PRs). You get PRs to bump packages and actions; merge after CI passes.

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



## License

MIT.
