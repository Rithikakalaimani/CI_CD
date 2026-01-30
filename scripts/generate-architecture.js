/**
 * Generates public/architecture.json from .github/workflows/deploy.yml at build time.
 * Powers the /architecture infra visualization page.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import yaml from 'js-yaml'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const workflowPath = path.join(root, '.github/workflows/deploy.yml')
const outPath = path.join(root, 'public/architecture.json')

const yamlText = fs.readFileSync(workflowPath, 'utf8')
const workflow = yaml.load(yamlText)

const on = workflow.on || {}
const push = on.push || {}
const pr = on.pull_request || {}

const triggers = []
if (push.branches) {
  triggers.push({
    event: 'push',
    branches: Array.isArray(push.branches) ? push.branches : [push.branches],
    paths: push.paths || null,
    description: 'Push to branch',
  })
}
if (pr.branches) {
  triggers.push({
    event: 'pull_request',
    branches: Array.isArray(pr.branches) ? pr.branches : [pr.branches],
    paths: pr.paths || null,
    description: 'Pull request targeting branch',
  })
}

const jobs = []
const qualityGatesByJob = {
  validate: [
    { name: 'HTML (W3C Nu Validator)', type: 'validation', blocksDeploy: true },
    { name: 'Link check (Lychee)', type: 'validation', blocksDeploy: true },
  ],
  build: [
    { name: 'npm audit (high/critical)', type: 'security', blocksDeploy: true },
    { name: 'Vite build', type: 'build', blocksDeploy: true },
  ],
  lighthouse: [
    { name: 'Lighthouse CI (performance, a11y, best-practices, SEO)', type: 'quality', blocksDeploy: true },
  ],
  deploy: [],
  'smoke-test': [
    { name: 'HTTP 200 + critical content', type: 'smoke', blocksDeploy: false },
  ],
}

for (const [id, def] of Object.entries(workflow.jobs || {})) {
  const name = typeof def.name === 'string' ? def.name : id
  jobs.push({
    id,
    name,
    needs: def.needs ? (Array.isArray(def.needs) ? def.needs : [def.needs]) : [],
    runsOn: def['runs-on'] || 'ubuntu-latest',
    environment: def.environment || null,
    condition: def.if || null,
    qualityGates: qualityGatesByJob[id] || [],
  })
}

const environments = [
  { id: 'runner', name: 'GitHub-hosted runner', value: 'ubuntu-latest', usedBy: jobs.map((j) => j.id) },
  { id: 'github-pages', name: 'GitHub Pages', value: 'github-pages', usedBy: jobs.filter((j) => j.environment === 'github-pages').map((j) => j.id) },
]

const architecture = {
  generatedAt: new Date().toISOString(),
  workflowName: workflow.name || 'Deploy to GitHub Pages',
  workflowFile: 'deploy.yml',
  triggers,
  jobs,
  environments,
  concurrency: workflow.concurrency
    ? { group: workflow.concurrency.group, cancelInProgress: workflow.concurrency['cancel-in-progress'] }
    : null,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(architecture, null, 2), 'utf8')
console.log('Generated public/architecture.json')
