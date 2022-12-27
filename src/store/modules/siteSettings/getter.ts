import type { GetterTree } from 'vuex'
import type { RootState } from '../root/state'
import { EGetters } from '../root/enum'
import type { State } from './state'

export interface Getters<S = State> {
  [EGetters.isEnabledSite] (state: S): (siteKey: string) => boolean
}

const getters: GetterTree<State, RootState> & Getters = {
  [EGetters.isEnabledSite](state) {
    return siteKey => state.enabledSites.includes(siteKey)
  },
}

export default getters
