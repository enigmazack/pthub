import type { CommitOptions, DispatchOptions, Module, Store } from 'vuex'
import type { RootState } from '../root/state'
import type { State } from './state'
import type { Getters } from './getter'
import type { Mutations } from './mutations'
import type { Actions } from './actions'
import state from './state'
import getters from './getter'
import mutations from './mutations'
import actions from './actions'

const siteSettings: Module<State, RootState> = {
  state,
  getters,
  mutations,
  actions,
}

export default siteSettings

// store type
export type SiteSettingsStore<S = State> = Omit<Store<S>, 'getters' | 'commit' | 'dispatch'> & {
  commit<K extends keyof Mutations, P extends Parameters<Mutations[K]>[1]>(
    key: K,
    payload: P,
    options?: CommitOptions
  ): ReturnType<Mutations[K]>
} & {
  dispatch<K extends keyof Actions>(
    key: K,
    payload?: Parameters<Actions[K]>[1],
    options?: DispatchOptions
  ): ReturnType<Actions[K]>
} & {
  getters: {
    [K in keyof Getters]: ReturnType<Getters[K]>
  }
}
