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
import { siteSettingsStorage } from '@/store/storage'

export interface SearchConfig {
  siteKey: string,
  name: string,
  pattern: string
}

// state
export interface SiteSettingsState {
  concurrencyRequests: number,
  enabledSites: string[],
  searchConfigs: SearchConfig[]
}

const state: SiteSettingsState = {
  concurrencyRequests: 5,
  enabledSites: [],
  searchConfigs: []
}

// getters
type Getters = {
}

const getters: GetterTree<SiteSettingsState, RootState> & Getters = {
}

// mutations
type Mutations<S = SiteSettingsState> = {
  [EMutations.initSiteSettings] (state: S, payload: S): void,
  [EMutations.toggleEnabledSite] (state: S, payload: string): void,
  [EMutations.updateSearchConfigs] (state: S, payload: SearchConfig): void,
  [EMutations.deleteSearchConfigs] (state: S, payload: SearchConfig): void,
  [EMutations.setConcurrencyRequests] (state: S, payload: number): void,
}

const mutations: MutationTree<SiteSettingsState> & Mutations = {
  [EMutations.initSiteSettings] (state, data) {
    state.enabledSites = data.enabledSites || []
    state.searchConfigs = data.searchConfigs || []
    state.concurrencyRequests = data.concurrencyRequests || 5
  },
  [EMutations.toggleEnabledSite] (state, site) {
    const index = state.enabledSites.findIndex(s => site === s)
    if (index !== -1) {
      state.enabledSites.splice(index, 1)
    } else {
      state.enabledSites.push(site)
    }
  },
  [EMutations.updateSearchConfigs] (state, searchConfig) {
    const index = state.searchConfigs.findIndex(config =>
      config.siteKey === searchConfig.siteKey && config.name === searchConfig.name)
    if (index === -1) {
      state.searchConfigs.push(searchConfig)
    } else {
      state.searchConfigs[index] = searchConfig
    }
  },
  [EMutations.deleteSearchConfigs] (state, searchConfig) {
    const index = state.searchConfigs.findIndex(config =>
      config.siteKey === searchConfig.siteKey && config.name === searchConfig.name)
    if (index !== -1) {
      state.searchConfigs.splice(index, 1)
    }
  },
  [EMutations.setConcurrencyRequests] (state, payload) {
    state.concurrencyRequests = payload
  }
}

// actions
type Actions<S = SiteSettingsState, R = RootState> = {
  [EActions.initSiteSettings] (context: ActionContext<S, R>): Promise<void>,
  [EActions.toggleEnabledSite] (context: ActionContext<S, R>, payload: {site: string}): Promise<void>,
  [EActions.updateSearchConfigs] (context: ActionContext<S, R>, payload: {searchConfig: SearchConfig}): Promise<void>,
  [EActions.deleteSearchConfigs] (context: ActionContext<S, R>, payload: {searchConfig: SearchConfig}): Promise<void>,
  [EActions.setConcurrencyRequests] (context: ActionContext<S, R>, payload: {number: number}): Promise<void>,
}

const actions: ActionTree<SiteSettingsState, RootState> & Actions = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async [EActions.initSiteSettings] ({ commit, state }) {
    // load data from the local storage when extension start
    const data = await siteSettingsStorage.get()
    if (data !== undefined) {
      commit(EMutations.initSiteSettings, data)
    } else {
      // for new installed extension, init the storage with empty data
      await siteSettingsStorage.set(state)
    }
  },
  async [EActions.toggleEnabledSite] ({ commit, state }, { site }) {
    commit(EMutations.toggleEnabledSite, site)
    await siteSettingsStorage.set(state)
  },
  async [EActions.updateSearchConfigs] ({ commit, state }, { searchConfig }) {
    commit(EMutations.updateSearchConfigs, searchConfig)
    await siteSettingsStorage.set(state)
  },
  async [EActions.deleteSearchConfigs] ({ commit, state }, { searchConfig }) {
    commit(EMutations.deleteSearchConfigs, searchConfig)
    await siteSettingsStorage.set(state)
  },
  async [EActions.setConcurrencyRequests] ({ commit, state }, { number }) {
    commit(EMutations.setConcurrencyRequests, number)
    await siteSettingsStorage.set(state)
  }
}

// modules
const siteSettings: Module<SiteSettingsState, RootState> = {
  state,
  getters,
  mutations,
  actions
}

export default siteSettings

// store type
export type SiteSettingsStore<S = SiteSettingsState> = Omit<Store<S>, 'getters' | 'commit' | 'dispatch'> & {
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
