/* eslint-disable @typescript-eslint/no-explicit-any */
// import { sendMessage, onMessage } from 'webext-bridge'
import browser from 'webextension-polyfill'
import axios, { AxiosStatic } from 'axios'
import { ourbits } from '@/sites'
import * as $ from 'jquery'

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
    axios: AxiosStatic;
    ourbits: any;
    $: any
  }
}

window.axios = axios
window.ourbits = ourbits
window.$ = $
