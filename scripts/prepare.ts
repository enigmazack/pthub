// generate stub index.html files for dev entry
import fs from 'fs-extra'
import chokidar from 'chokidar'
import { getManifest } from '../src/manifest'
import { r, port, isDev, log } from './utils'

/**
 * Stub index.html to use Vite in development
 */
async function stubIndexHtml () {
  // stub background for dev
  await fs.ensureDir(r('extension/dist/background'))
  let data: string
  data = await fs.readFile(r('src/background/index.html'), 'utf-8')
  data = data
    .replace('"./main.ts"', `"http://localhost:${port}/background/main.ts"`)
    .replace('<div id="app"></div>', '<div id="app">Vite server did not start</div>')
  await fs.writeFile(r('extension/dist/background/index.html'), data, 'utf-8')
  log('PRE', 'stub background')
  // stub main app
  data = await fs.readFile(r('src/index.html'), 'utf-8')
  data = data
    .replace('"./main.ts"', `"http://localhost:${port}/main.ts"`)
    .replace('<div id="app"></div>', '<div id="app">Vite server did not start</div>')
  await fs.writeFile(r('extension/dist/index.html'), data, 'utf-8')
  log('PRE', 'stub main')
}

// stub background for build
async function stubBackgroundHtml (): Promise<void> {
  let data = await fs.readFile(r('extension/dist/background/index.html'), 'utf-8')
  data = data
    .replace(/\/assets/g, '../assets')
  await fs.writeFile(r('extension/dist/background/index.html'), data, 'utf-8')
  log('PRE', 'stub background')
}

export async function writeManifest (): Promise<void> {
  await fs.writeJSON(r('extension/manifest.json'), await getManifest(), { spaces: 2 })
  log('PRE', 'write manifest.json')
}

writeManifest()

if (isDev) {
  stubIndexHtml()
  chokidar.watch(r('src/**/*.html'))
    .on('change', () => {
      stubIndexHtml()
    })
  chokidar.watch([r('src/manifest.ts'), r('package.json')])
    .on('change', () => {
      writeManifest()
    })
} else {
  stubBackgroundHtml()
}
