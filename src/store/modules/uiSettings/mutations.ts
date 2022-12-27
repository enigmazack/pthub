import type { MutationTree } from 'vuex'
import { EMutations } from '../root/enum'
import type { State } from './state'

export interface Mutations<S = State> {
  [EMutations.initUiSettings] (state: S, payload: S): void
  [EMutations.toggleSiderCollapsed] (state: S): void
  [EMutations.setLocale] (state: S, payload: string): void
}

const mutations: MutationTree<State> & Mutations = {
  [EMutations.initUiSettings](state, payload) {
    state.siderCollapsed = payload.siderCollapsed
    state.locale = payload.locale || 'zh_CN'
  },
  [EMutations.toggleSiderCollapsed](state) {
    state.siderCollapsed = !state.siderCollapsed
  },
  [EMutations.setLocale](state, payload): void {
    state.locale = payload
  },
}

export default mutations

