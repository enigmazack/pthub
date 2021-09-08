import fs from 'fs-extra'
import type { Manifest } from 'webextension-polyfill'
import type PkgType from '../package.json'
import { isDev, port, r } from '../scripts/utils'

export async function getManifest (): Promise<Manifest.WebExtensionManifest> {
  const pkg: typeof PkgType = await fs.readJSON(r('package.json'))
  // update this file to update this manifest.json
  // can also be conditional based on your need
  const manifest: Manifest.WebExtensionManifest = {
    manifest_version: 2,
    name: pkg.displayName,
    version: pkg.version,
    description: pkg.description,
    browser_action: {
      default_icon: {
        19: './assets/icon-19.png',
        38: './assets/icon-38.png'
      }
    },
    background: {
      page: './dist/background/index.html',
      persistent: false
    },
    icons: {
      16: './assets/icon-16.png',
      48: './assets/icon-48.png',
      128: './assets/icon-128.png'
    },
    permissions: [
      'tabs',
      'storage',
      'http://*/',
      'https://*/'
    ],
    // this is required on dev for Vite script to load, unsafe-eval required by antdv
    content_security_policy: isDev
      ? `script-src 'self' http://localhost:${port} 'unsafe-eval'; object-src 'self'`
      : 'script-src \'self\' \'unsafe-eval\'; object-src \'self\''
  }

  return manifest
}
