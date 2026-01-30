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



## License

MIT.
