import { InjectionKey } from 'vue'
import { createStore, useStore as baseUseStore, Store } from 'vuex'
import uiSettings, { UISettings } from './uiSettings'
import siteData, { SiteData } from './siteData'

export interface GlobalData {
  uiSettings: UISettings
  siteData: SiteData
}

// eslint-disable-next-line symbol-description
export const key: InjectionKey<Store<GlobalData>> = Symbol()

export const store = createStore<GlobalData>({
  modules: {
    uiSettings,
    siteData
  }
})

export function useStore ():Store<GlobalData> {
  return baseUseStore(key)
}
