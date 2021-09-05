/* eslint-disable @typescript-eslint/no-explicit-any */
import browser from 'webextension-polyfill'
import sites from '@/sites'

if (import.meta.hot) {
  // @ts-expect-error for background HMR on dev
  // eslint-disable-next-line import/no-absolute-path
  import('/@vite/client')
}

browser.browserAction.onClicked.addListener(function () {
  browser.tabs.create({ url: browser.runtime.getURL('dist/view/index.html') })
})

declare global {
  interface Window {
    sites: any
  }
}

window.sites = sites
