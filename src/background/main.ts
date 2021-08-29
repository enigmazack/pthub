// import { sendMessage, onMessage } from 'webext-bridge'
import browser from 'webextension-polyfill'
import axios, { AxiosStatic } from 'axios'
import ourbits from '../sites/ourbits.club'
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ourbits: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $: any
  }
}

window.axios = axios
window.ourbits = ourbits
window.$ = $
