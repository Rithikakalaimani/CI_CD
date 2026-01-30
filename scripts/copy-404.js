import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
fs.cpSync(path.join(root, 'dist/index.html'), path.join(root, 'dist/404.html'))
console.log('Copied dist/index.html to dist/404.html for SPA fallback')
