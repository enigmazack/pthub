/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'
import browser from 'webextension-polyfill'
import sites from '@/sites'
import jsSHA from 'jssha'

if (import.meta.hot) {
  // @ts-expect-error for background HMR on dev
  // eslint-disable-next-line import/no-absolute-path
  import('/@vite/client')
}

// click the ext icon and open the main app view
browser.browserAction.onClicked.addListener(function () {
  browser.tabs.create({ url: browser.runtime.getURL('dist/index.html') })
})

// for dev
declare global {
  interface Window {
    sites: any,
    axios: any,
    sha1: any
  }
}

function sha1 (content: Uint8Array): string {
  // eslint-disable-next-line new-cap
  const shaObj = new jsSHA('SHA-1', 'UINT8ARRAY')
  shaObj.update(content)
  return shaObj.getHash('HEX')
}

window.sites = sites
window.axios = axios
window.sha1 = sha1
