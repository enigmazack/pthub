import browser from 'webextension-polyfill'
import type { State as UISettingsState } from './modules/uiSettings/state'
import type { State as SiteSettingsState } from './modules/siteSettings/state'
import type { State as UserDataState } from './modules/userData/state'

// provide browser local storage

class LocalStorage<T> {
  key: string
  constructor(key: string) {
    this.key = key
  }

  async get(): Promise<T | undefined> {
    let data: T
    try {
      const result = await browser.storage.local.get(this.key)
      data = JSON.parse(result[this.key])
    }
    catch {
      return undefined
    }
    return data
  }

  async set(data: T): Promise<void> {
    const items: any = {}
    // store data as object is vary buggy, use JSON instead
    items[this.key] = JSON.stringify(data)
    await browser.storage.local.set(items)
  }
}

const uiSettingsStorage: LocalStorage<UISettingsState> = new LocalStorage('uiSettings')
const userDataStorage: LocalStorage<UserDataState> = new LocalStorage('userData')
const siteSettingsStorage: LocalStorage<SiteSettingsState> = new LocalStorage('siteSettings')

export {
  uiSettingsStorage,
  userDataStorage,
  siteSettingsStorage,
}
