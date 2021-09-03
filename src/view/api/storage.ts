import browser from 'webextension-polyfill'
import { UISettings } from '../store/uiSettings'

class LocalStorage<T> {
  key: string
  constructor (key: string) {
    this.key = key
  }

  async get (): Promise<T|undefined> {
    try {
      const data = await browser.storage.local.get(this.key)
      return data[this.key]
    } catch {
      return undefined
    }
  }

  async set (data: T): Promise<void> {
    const value = data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: any = {}
    items[this.key] = value
    await browser.storage.local.set(items)
  }
}

const uiSettingsStorage: LocalStorage<UISettings> = new LocalStorage('uiSettings')

export { uiSettingsStorage }
