import { InjectionKey } from 'vue'
import { createStore, useStore as baseUseStore, Store } from 'vuex'
import uiSettings, { UISettingsState } from './uiSettings'
import siteData, { SiteDataState } from './siteData'

export interface RootState {
  uiSettings: UISettingsState
  siteData: SiteDataState
}

// eslint-disable-next-line symbol-description
export const key: InjectionKey<Store<RootState>> = Symbol()

export const store = createStore<RootState>({
  modules: {
    uiSettings,
    siteData
  }
})

export function useStore ():Store<RootState> {
  return baseUseStore(key)
}
