import browser from 'webextension-polyfill'
import { UISettingsState } from '../store/uiSettings'
import { SiteDataState } from '../store/siteData'

class LocalStorage<T> {
  key: string
  constructor (key: string) {
    this.key = key
  }

  async get (): Promise<T|undefined> {
    let data: T
    try {
      const result = await browser.storage.local.get(this.key)
      data = JSON.parse(result[this.key])
    } catch {
      return undefined
    }
    return data
  }

  async set (data: T): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: any = {}
    // store data as object is vary buggy, use JSON instead
    items[this.key] = JSON.stringify(data)
    await browser.storage.local.set(items)
  }
}

const uiSettingsStorage: LocalStorage<UISettingsState> = new LocalStorage('uiSettings')
const siteDataStorage: LocalStorage<SiteDataState> = new LocalStorage('siteData')

export {
  uiSettingsStorage,
  siteDataStorage
}
