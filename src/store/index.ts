import { createStore } from 'vuex'
import uiSettings from './modules/uiSettings'
import userData from './modules/userData'
import siteSettings from './modules/siteSettings'
import params from './modules/params'
import type { RootState } from './modules/root/state'
import type { UISettingsStore } from './modules/uiSettings'
import type { UserDataStore } from './modules/userData'
import type { SiteSettingsStore } from './modules/siteSettings'
import type { ParamsStore } from './modules/params'
import { EActions, EGetters, EMutations } from './modules/root/enum'

export { EActions, EGetters, EMutations }

export const store = createStore<RootState>({
  modules: {
    uiSettings,
    userData,
    siteSettings,
    params,
  },
})

export type Store = UISettingsStore<Pick<RootState, 'uiSettings'>> &
UserDataStore<Pick<RootState, 'userData'>> &
SiteSettingsStore<Pick<RootState, 'siteSettings'>> &
ParamsStore<Pick<RootState, 'params'>>

export function useStore(): Store {
  return store as Store
}
