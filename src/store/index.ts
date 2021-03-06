// import { InjectionKey } from 'vue'
import { createStore } from 'vuex'
import uiSettings, { UISettingsState, UISettingsStore } from './modules/uiSettings'
import userData, { UserDataState, UserDataStore } from './modules/userData'
import siteSettings, { SiteSettingsState, SiteSettingsStore } from './modules/siteSettings'
import params, { ParamsState, ParamsStore } from './modules/params'

export { EActions, EMutations } from './enum'

export interface RootState {
  uiSettings: UISettingsState
  userData: UserDataState
  siteSettings: SiteSettingsState
  params: ParamsState
}

// eslint-disable-next-line symbol-description
// export const key: InjectionKey<Store<RootState>> = Symbol()

export type Store = UISettingsStore<Pick<RootState, 'uiSettings'>> &
  UserDataStore<Pick<RootState, 'userData'>> &
  SiteSettingsStore<Pick<RootState, 'siteSettings'>> &
  ParamsStore<Pick<RootState, 'params'>>

export const store = createStore<RootState>({
  modules: {
    uiSettings,
    userData,
    siteSettings,
    params
  }
})

export function useStore ():Store {
  return store as Store
}
