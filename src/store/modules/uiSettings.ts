import {
  ActionContext,
  ActionTree,
  CommitOptions,
  DispatchOptions,
  GetterTree,
  Module,
  MutationTree,
  Store
} from 'vuex'
import {
  RootState,
  EGetters,
  EMutations,
  EActions
} from '@/store'
import { uiSettingsStorage } from '@/store/storage'

// state
export interface UISettingsState {
  siderCollapsed: boolean
}

const state: UISettingsState = {
  siderCollapsed: false
}

// getters
type Getters = {
  [EGetters.noGetters] (): void
}

const getters: GetterTree<UISettingsState, RootState> & Getters = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  [EGetters.noGetters] () {}
}

// mutations
type Mutations<S = UISettingsState> = {
  [EMutations.initUiSettings] (state: S, payload: S): void
  [EMutations.toggleSiderCollapsed] (state: S): void,
}

const mutations: MutationTree<UISettingsState> & Mutations = {
  [EMutations.initUiSettings] (state, payload) {
    state.siderCollapsed = payload.siderCollapsed
  },
  [EMutations.toggleSiderCollapsed] (state) {
    state.siderCollapsed = !state.siderCollapsed
  }
}

// actions
type Actions<S = UISettingsState, R = RootState> = {
  [EActions.initUiSettings] (context: ActionContext<S, R>): Promise<void>
  [EActions.toggleSiderCollapsed] (context: ActionContext<S, R>): Promise<void>
}

const actions: ActionTree<UISettingsState, RootState> & Actions = {
  async [EActions.initUiSettings] ({ commit, state }) {
    const data = await uiSettingsStorage.get()
    if (data !== undefined) {
      commit(EMutations.initUiSettings, data)
    } else {
      await uiSettingsStorage.set(state)
    }
  },
  async [EActions.toggleSiderCollapsed] ({ commit, state }) {
    commit(EMutations.toggleSiderCollapsed)
    await uiSettingsStorage.set(state)
  }
}

// modules
const uiSettings: Module<UISettingsState, RootState> = {
  state,
  getters,
  mutations,
  actions
}

export default uiSettings

// store type
export type UISettingsStore<S = UISettingsState> = Omit<Store<S>, 'getters' | 'commit' | 'dispatch'> & {
  commit<K extends keyof Mutations, P extends Parameters<Mutations[K]>[1]>(
    key: K,
    payload: P,
    options?: CommitOptions
  ): ReturnType<Mutations[K]>
} & {
  dispatch<K extends keyof Actions>(
    key: K,
    payload: Parameters<Actions[K]>[1],
    options?: DispatchOptions
  ): ReturnType<Actions[K]>
} & {
  getters: {
    [K in keyof Getters]: ReturnType<Getters[K]>
  }
}
