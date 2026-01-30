# Pipeline Shrine — CI/CD Learning Hub

[![Deploy to GitHub Pages](https://github.com/OWNER/REPO/actions/workflows/deploy.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/deploy.yml)

An **anime-themed 3D learning environment** where you explore CI/CD concepts by visiting shrines in a simulated world. Built with **React**, **Vite**, and **Three.js** (React Three Fiber). The app is deployed to **GitHub Pages** via a path-filtered workflow with quality gates and Lighthouse CI.

> **Replace `OWNER` and `REPO`** in the badge URL above with your GitHub username and repository name.

## The App — Pipeline Shrine

- **3D world**: A Japanese-anime–style night scene with stars and five shrines (stages). Drag to rotate, scroll to zoom.
- **Learning stages**: Each shrine teaches one CI/CD concept — **Commit**, **Build**, **Test**, **Deploy**, **Monitor**. Click a shrine to open a panel with **live metrics** (from version.json and GitHub API).
- **Analytics Hub**: Use the top-right **Analytics Hub** button to open a dashboard with **real-time** pipeline metrics: commits today, last deploy, build time, tests passed, commit SHA, and stages visited.
- **Tech**: Vite + React, React Three Fiber + Drei for 3D.

### Real-time analytics

- **version.json** (written by CI at deploy): `deployedAt`, `shortSha`, `buildDurationSeconds`, `checksPassed`. The app fetches it from the deployed site and shows “Last deploy”, “Build time”, “Tests passed”, “Commit SHA”, “Pipeline health”.
- **Commits today**: Set `VITE_GITHUB_REPO=owner/repo` (e.g. in a `.env` file or in your hosting env) so the app can call the public GitHub API for commit count since midnight UTC. Without it, “Commits today” shows —.

## What This Project Does (CI/CD)

- **Path-filtered deployment**: The workflow runs when `index.html`, `lighthouserc.json`, `src/**`, or package files change on `main`.
- **Quality gate**: Before any deploy, the workflow runs **HTML validation** (W3C Nu Validator), **link checking** (lychee), **npm audit** (fail on high/critical vulns), and **Lighthouse CI** (performance, accessibility, best practices, SEO). Deploy runs only if all pass.
- **Lighthouse CI**: The site is audited locally with score assertions; reports are uploaded as workflow artifacts and to temporary public storage.
- **Dependabot**: [`.github/dependabot.yml`](.github/dependabot.yml) enables weekly dependency update PRs for npm and GitHub Actions.
- **Scheduled availability check**: [`.github/workflows/availability-check.yml`](.github/workflows/availability-check.yml) runs every 6 hours (and manually) to verify the live site is up.
- **Optional deploy notification**: Set the `DEPLOY_NOTIFY_WEBHOOK` secret (e.g. Slack/Discord webhook URL) to post a message on deploy success.
- **Pull request checks**: On pull requests that touch `index.html` or `lighthouserc.json`, the same checks run (no deploy). Merge only when checks are green.
- **Deployment metadata**: Each deploy generates a `version.json` with timestamp and commit SHA. The site footer shows “Last deployed” and short SHA when viewing the live site.
- **GitHub Pages**: The site is published using the official [GitHub Actions deployment](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow) flow (`actions/deploy-pages`).
- **Blue-green deployment (optional)**: Path-based blue-green slots (`/blue/` and `/green/`) with deploy to the inactive slot and a manual **switch** workflow to promote it to live. See [Blue-green deployment](#blue-green-deployment).

## Repository Setup

1. **Create a new repository** on GitHub (e.g. `static-pages-pipeline` or any name you prefer). Do not initialize with a README if you are pushing this project into it.

2. **Publish this project** to that repo:

   ```bash
   git init
   git add .
   git commit -m "Initial commit: static site and deploy workflow"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo-name>.git
   git push -u origin main
   ```

3. **Enable GitHub Pages from GitHub Actions**  
   In the repo: **Settings → Pages → Build and deployment**
   - **Source**: choose **GitHub Actions**.  
     After the first run of the workflow, the site will be available at:
     `https://<username>.github.io/<repo-name>/`

4. **Branch protection (recommended)**  
   Require CI checks before merging to `main`: **Settings → Branches → Add rule** (or **Branch protection rules**).
   - **Branch name pattern**: `main`
   - Enable **Require status checks to pass before merging**
   - In **Status checks that are required**, search and add:
     - **Validate site**
     - **Lighthouse CI**
   - Save. PRs targeting `main` will then need both checks to pass before merge.  
     _Resume: “Enforced branch protection with required CI checks before merge to main.”_

## Workflow Overview

The workflow is defined in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

| Job / Step     | When                                                           | Description                                                                                                                               |
| -------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Trigger**    | `push` or `pull_request` to `main`                             | When `index.html`, `lighthouserc.json`, `src/**`, or package files change.                                                                |
| **validate**   | Every run                                                      | Checkout → HTML validation (W3C Nu Validator) → link check (lychee).                                                                      |
| **build**      | Every run                                                      | Checkout → `npm ci` → **npm audit** (fail on high/critical) → build → generate `version.json` in dist → upload **dist** as Pages artifact.  |
| **lighthouse** | After build                                                    | Checkout → build → run Lighthouse CI against **dist** (see `lighthouserc.json`). Asserts performance, accessibility, best practices, SEO. |
| **deploy**     | Only on `push` to `main` (after validate + build + lighthouse) | Configure Pages → deploy using the artifact uploaded by **build**.                                                                        |
| **smoke-test** | Only on `push` to `main` (after deploy)                        | Wait for Pages → curl live URL → assert HTTP 200 and that critical content (e.g. "Pipeline Shrine") is present.                           |

**Other workflows**

- **[availability-check.yml](.github/workflows/availability-check.yml)** — Runs on a schedule (every 6 hours) and via **Run workflow**; curls the live site and fails if HTTP is not 200.
- **[blue-green-deploy.yml](.github/workflows/blue-green-deploy.yml)** — When blue-green is enabled, builds the app for the inactive slot and pushes to branch `gh-pages-content` (see [Blue-green deployment](#blue-green-deployment)).
- **[blue-green-switch.yml](.github/workflows/blue-green-switch.yml)** — Manual workflow to switch traffic to the inactive slot (promote it to live).
- **Dependabot** (not a workflow) — Configured in [.github/dependabot.yml](.github/dependabot.yml); opens weekly PRs for npm and GitHub Actions updates.

## Blue-green deployment

This project supports an **optional** path-based blue-green deployment strategy: two slots (`blue` and `green`) are deployed under `https://<user>.github.io/<repo>/blue/` and `.../green/`. The root URL redirects to the currently **active** slot. You deploy new versions to the **inactive** slot, test them there, then **switch** traffic to make that slot live.

### Enabling blue-green

1. **Create the state file** so the blue-green workflow runs:
   - Add a directory `.blue-green/` and a file `.blue-green/active.txt` containing either `blue` or `green` (the slot that is currently “live”). For example:
     ```bash
     mkdir -p .blue-green
     echo blue > .blue-green/active.txt
     git add .blue-green/active.txt
     git commit -m "Enable blue-green deployment (blue is live)"
     git push origin main
     ```
2. **Switch GitHub Pages to the content branch** (required for blue-green to serve the slots):
   - In the repo: **Settings → Pages → Build and deployment**.
   - Under **Source**, choose **Deploy from a branch** (not “GitHub Actions”).
   - **Branch**: select `gh-pages-content` and `/ (root)`.
   - Save. The first run of **Blue-green deploy** will create `gh-pages-content` if it doesn’t exist.

After that, the **Blue-green deploy** workflow will run on pushes to `main` (same path filters as the main deploy). It builds the app with the correct base path for the inactive slot and updates the `gh-pages-content` branch. The root `index.html` on that branch redirects to the active slot.

### URLs

- **Live (redirects to active slot)**: `https://<user>.github.io/<repo>/`
- **Blue slot**: `https://<user>.github.io/<repo>/blue/`
- **Green slot**: `https://<user>.github.io/<repo>/green/`

Test the inactive slot at its URL before switching.

### Switching traffic (promote inactive to live)

1. Deploy as usual (push to `main`); the new build goes to the **inactive** slot.
2. Open the inactive slot URL (e.g. `.../green/`) and verify the new version.
3. In the repo, open **Actions → Blue-green switch** → **Run workflow**.
4. The workflow updates `.blue-green/active.txt` on `main` and the redirect on `gh-pages-content` so the root URL now points to the previously inactive slot. That slot is now live.

_Resume: “Blue-green deployment with path-based slots and manual traffic switch.”_

## How to See It Working

**Deploy on push to main**

1. Edit `index.html` (e.g. change a heading or a line of text).
2. Commit and push to `main`:
   ```bash
   git add index.html
   git commit -m "Update landing page copy"
   git push origin main
   ```
3. In the repo, open **Actions**; the workflow runs (validate + lighthouse → deploy).
4. After it finishes, open your GitHub Pages URL; the updated content is live and the footer shows “Last deployed” and the short commit SHA.

**Validation on pull requests**

1. Create a branch, change `index.html`, and open a PR to `main`.
2. The workflow runs the **validate** job only (no deploy).
3. Merge only when checks are green; merging to `main` triggers the full deploy.

If you push a change that does **not** touch `index.html`, the workflow does not run.

## How to Check and See Everything

Follow these steps to verify the pipeline end-to-end.

### 1. Push the project and enable Pages

- Create a new repo on GitHub (e.g. `static-pages-pipeline`).
- In your project folder, run:
  ```bash
  cd /path/to/CICD
  git init
  git add .
  git commit -m "Initial commit: static site and deploy workflow"
  git branch -M main
  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
  git push -u origin main
  ```
- In the repo on GitHub: **Settings → Pages → Build and deployment** → set **Source** to **GitHub Actions**.

### 2. Trigger a deploy and watch Actions

- Edit `index.html` (e.g. change the hero heading to “Deploy on every change – verified”).
- Commit and push:
  ```bash
  git add index.html
  git commit -m "Update hero text"
  git push origin main
  ```
- **Where to check:** In the repo, open the **Actions** tab.
  - You should see a run for **“Deploy to GitHub Pages”**.
  - Open the run → you’ll see:
    - **validate** job: “Validate HTML (W3C Nu Validator)” and “Check links (lychee)” (both should be green).
    - **deploy** job: “Deploy to GitHub Pages” (runs after validate).
  - Wait until the run shows a green check.

### 3. See the live site and “Last deployed”

- **Where to check:** Open your GitHub Pages URL:  
  `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`
- You should see your updated content (e.g. the new hero text).
- Scroll to the **footer**. You should see something like:  
  **“Last deployed: &lt;date/time&gt; · &lt;short-sha&gt;”**  
  That confirms the deploy ran and `version.json` is being loaded.

### 4. See that only `index.html` triggers the workflow

- Change **only** the README (e.g. add a line), then commit and push:
  ```bash
  git add README.md
  git commit -m "Docs: update README"
  git push origin main
  ```
- **Where to check:** **Actions** tab.  
  There should be **no** new run for “Deploy to GitHub Pages”, because `index.html` didn’t change.

### 5. See PR validation (no deploy)

- Create a branch, change `index.html`, and open a PR to `main`:
  ```bash
  git checkout -b test-pr-check
  # edit index.html (e.g. change one word)
  git add index.html
  git commit -m "Test: PR validation"
  git push -u origin test-pr-check
  ```
- On GitHub, open a **Pull request** from `test-pr-check` to `main`.
- **Where to check:** On the PR page, the **Checks** section should show the workflow running. Open **Details** → you’ll see only the **validate** job (no **deploy** job). Merge when it’s green.

### 6. Update the README badge (optional)

- In the README at the top, replace `OWNER` and `REPO` in the badge URL with your GitHub username and repo name, e.g.:  
  `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/deploy.yml/badge.svg`  
  Then the badge will show the status of your workflow (passing/failing) on the repo’s main page.

---

## Lighthouse CI

The pipeline runs [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) via [treosh/lighthouse-ci-action](https://github.com/treosh/lighthouse-ci-action). After `npm run build`, Lighthouse audits the **dist/** output and asserts:

- **Performance** ≥ 0.6 (warn)
- **Accessibility** ≥ 0.85 (error)
- **Best practices** ≥ 0.85 (warn)
- **SEO** ≥ 0.85 (warn)

Configuration is in [**lighthouserc.json**](lighthouserc.json). You can change thresholds or add audits there. Reports are saved as workflow artifacts and (optionally) to temporary public storage so you can open the HTML report from the Actions run.

## Project Structure

```
.
├── .blue-green/
│   └── active.txt        # Current live slot: "blue" or "green" (enables blue-green)
├── .github/workflows/
│   ├── deploy.yml        # Validate → build → Lighthouse CI → deploy
│   ├── blue-green-deploy.yml   # Deploy to inactive slot (when active.txt exists)
│   ├── blue-green-switch.yml   # Manual: switch traffic to inactive slot
│   └── availability-check.yml
├── src/
│   ├── main.jsx          # Entry
│   ├── App.jsx           # Root: Scene, OverlayPanel, AnalyticsHub
│   ├── index.css         # Global styles (anime theme)
│   ├── content/
│   │   └── stages.js     # CI/CD learning stages (shrines)
│   └── components/
│       ├── World/        # 3D scene, StagePillar
│       ├── OverlayPanel.jsx
│       └── AnalyticsHub.jsx
├── index.html            # Vite entry
├── package.json
├── vite.config.js
├── lighthouserc.json     # Lighthouse CI (staticDistDir: dist)
└── README.md
```

## Resume / Interview Talking Points

- **CI/CD**: Automated deployment on push to `main`, with a path-filtered trigger and quality gate before deploy.
- **Branch protection**: Enforced branch protection with required CI checks (“Validate site”, “Lighthouse CI”) before merge to `main` — see [Repository Setup](#repository-setup) step 4.
- **Quality gates**: HTML validation, link checking, **npm audit** (high/critical vulns), and Lighthouse CI must pass before deployment; any failure blocks deploy.
- **Dependency scanning**: npm audit in CI. _Resume: “Dependency vulnerability scanning in CI (npm audit).”_
- **Dependabot**: Automated dependency update PRs. _Resume: “Dependency updates via Dependabot.”_
- **Post-deploy smoke test**: After deploy, a job curls the live URL, asserts HTTP 200, and checks critical content. _Resume: “Post-deployment smoke tests to verify production availability and critical content.”_
- **Scheduled availability**: Workflow runs every 6 hours to verify the site is up. _Resume: “Scheduled availability checks to monitor production.”_
- **Pull request integration**: Same validation runs on PRs; deploy only on merge to `main`.
- **Path filters**: Workflow runs only when relevant files change, saving workflow minutes and keeping deploys intentional.
- **Deployment metadata**: CI generates `version.json` (timestamp, commit SHA); the site displays “Last deployed” in the footer for traceability.
- **GitHub Actions**: Use of `actions/checkout`, `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`, and third-party validation/link-check actions.
- **GitHub Pages**: Static site hosting with zero extra configuration.
- **Blue-green deployment**: Path-based blue/green slots with deploy to inactive slot and manual **Blue-green switch** workflow to promote to live. _Resume: “Blue-green deployment with path-based slots and manual traffic switch.”_ See [Blue-green deployment](#blue-green-deployment).

## Optional Next Steps

- Add more static assets and extend workflow `paths` so only site-related changes trigger runs.
- Add a **Lighthouse CI** or **performance budget** job to enforce performance/SEO before deploy.
- Use a static site generator (Hugo, Jekyll, Astro): add a build job, upload the build output as the artifact, and trigger on source file changes.
- Branch protection and post-deploy smoke test are already documented and (for smoke test) implemented; enable branch protection in GitHub Settings as in step 4 of [Repository Setup](#repository-setup).

## License

MIT (or your choice). Use and adapt as you like for learning and your portfolio.
