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
  EMutations,
  EActions
} from '@/store/enum'
import { RootState } from '@/store'
import { uiSettingsStorage } from '@/store/storage'

// state
export interface UISettingsState {
  siderCollapsed: boolean,
  concurrencyRequests: number,
  locale: string
}

const state: UISettingsState = {
  siderCollapsed: false,
  concurrencyRequests: 5,
  locale: 'zh_CN'
}

// getters
type Getters = {
}

const getters: GetterTree<UISettingsState, RootState> & Getters = {
}

// mutations
type Mutations<S = UISettingsState> = {
  [EMutations.initUiSettings] (state: S, payload: S): void,
  [EMutations.toggleSiderCollapsed] (state: S): void,
  [EMutations.setConcurrencyRequests] (state: S, payload: number): void,
  [EMutations.setLocale] (state: S, payload: string): void
}

const mutations: MutationTree<UISettingsState> & Mutations = {
  [EMutations.initUiSettings] (state, payload) {
    state.siderCollapsed = payload.siderCollapsed
    state.concurrencyRequests = payload.concurrencyRequests || state.concurrencyRequests
    state.locale = payload.locale || state.locale
  },
  [EMutations.toggleSiderCollapsed] (state) {
    state.siderCollapsed = !state.siderCollapsed
  },
  [EMutations.setConcurrencyRequests] (state, payload) {
    state.concurrencyRequests = payload
  },
  [EMutations.setLocale] (state, payload): void {
    state.locale = payload
  }
}

// actions
type Actions<S = UISettingsState, R = RootState> = {
  [EActions.initUiSettings] (context: ActionContext<S, R>): Promise<void>,
  [EActions.toggleSiderCollapsed] (context: ActionContext<S, R>): Promise<void>,
  [EActions.setConcurrencyRequests] (context: ActionContext<S, R>, payload: {number: number}): Promise<void>,
  [EActions.setLocale] (context: ActionContext<S, R>, payload: {locale: string}): Promise<void>
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
  },
  async [EActions.setConcurrencyRequests] ({ commit, state }, { number }) {
    commit(EMutations.setConcurrencyRequests, number)
    await uiSettingsStorage.set(state)
  },
  async [EActions.setLocale] ({ commit, state }, { locale }) {
    commit(EMutations.setLocale, locale)
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
    payload?: Parameters<Actions[K]>[1],
    options?: DispatchOptions
  ): ReturnType<Actions[K]>
} & {
  getters: {
    [K in keyof Getters]: ReturnType<Getters[K]>
  }
}
