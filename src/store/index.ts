// import { InjectionKey } from 'vue'
import { createStore } from 'vuex'
import uiSettings, { UISettingsState, UISettingsStore } from './modules/uiSettings'
import siteData, { SiteDataState, SiteDataStore } from './modules/siteData'
import { EGetters, EMutations, EActions } from './enum'

export { EGetters, EMutations, EActions }

export interface RootState {
  uiSettings: UISettingsState
  siteData: SiteDataState
}

// eslint-disable-next-line symbol-description
// export const key: InjectionKey<Store<RootState>> = Symbol()

export type Store = UISettingsStore<Pick<RootState, 'uiSettings'>> &
  SiteDataStore<Pick<RootState, 'siteData'>>

export const store = createStore<RootState>({
  modules: {
    uiSettings,
    siteData
  }
})

export function useStore ():Store {
  return store as Store
}
