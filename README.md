# Static Site CI/CD Pipeline

A small CI/CD project that deploys a static site to **GitHub Pages** only when `index.html` changes, using a path-filtered GitHub Actions workflow. Built for learning continuous integration and continuous deployment.

## What This Project Does

- **Path-filtered deployment**: The workflow runs only when `index.html` is modified on the `main` branch. Changes to other files (e.g. README, config) do not trigger a deploy, which keeps deployments intentional and saves workflow minutes.
- **GitHub Pages**: The site is published using the official [GitHub Actions deployment](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow) flow (`actions/deploy-pages`).
- **Single-page site**: The repo includes a minimal landing page in `index.html` (with inline CSS) so that any design or content change lives in one file and correctly triggers the workflow.

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

## Workflow Overview

The workflow is defined in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

| Step | Description |
|------|-------------|
| **Trigger** | `push` to `main` with changes only in `index.html` (`paths: ['index.html']`). |
| **Checkout** | Check out the repository. |
| **Configure Pages** | Prepare the job for GitHub Pages deployment. |
| **Upload artifact** | Upload the repository root (containing `index.html`) as the static site artifact. |
| **Deploy** | Deploy the artifact to GitHub Pages using `actions/deploy-pages`. |

## How to See It Working

1. Edit `index.html` (e.g. change a heading or a line of text).
2. Commit and push to `main`:
   ```bash
   git add index.html
   git commit -m "Update landing page copy"
   git push origin main
   ```
3. Open **Actions** in the repo; the “Deploy to GitHub Pages” workflow should run.
4. After it finishes, open your GitHub Pages URL; the updated content should be live.

If you push a change that does **not** touch `index.html` (e.g. only README or workflow file), the deploy workflow will not run.

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml    # Workflow: runs only on index.html change, deploys to Pages
├── index.html            # Single-page site (content + inline styles)
└── README.md             # This file
```

## Resume / Interview Talking Points

- **CI/CD**: Automated deployment on push to `main`, with a clear trigger (change to `index.html`).
- **Path filters**: Using `paths` in the workflow to avoid unnecessary runs and focus deploys on the actual site file.
- **GitHub Actions**: Use of `actions/checkout`, `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`.
- **GitHub Pages**: Publishing a static site with no extra hosting setup.

## Optional Next Steps

- Add more static assets (images, CSS/JS files) and, if you want deploys only for the site, extend the workflow `paths` to include those files.
- Try a static site generator (e.g. Hugo, Jekyll, Astro): build in the workflow and set `path` in `upload-pages-artifact` to the build output directory (e.g. `dist/` or `public/`), and add the source directories or key files to `paths` so only relevant changes trigger a deploy.

## License

MIT (or your choice). Use and adapt as you like for learning and your portfolio.
