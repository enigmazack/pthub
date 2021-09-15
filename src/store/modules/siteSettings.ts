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
import { v4 as uuidv4 } from 'uuid'

export interface SearchConfig {
  siteKey: string,
  name: string,
  pattern: string
}

export interface SearchConfigWithKey extends SearchConfig {
  key: string
}

// state
export interface SiteSettingsState {
  concurrencyRequests: number,
  expectTorrents: number,
  enabledSites: string[],
  searchConfigs: SearchConfigWithKey[]
}

const state: SiteSettingsState = {
  concurrencyRequests: 5,
  expectTorrents: 50,
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
  [EMutations.setConcurrencyRequests] (state: S, payload: number): void,
  [EMutations.setExpectTorrents] (state: S, payload: number): void,
  [EMutations.updateSearchConfigs] (state: S, payload: SearchConfigWithKey): void,
  [EMutations.deleteSearchConfigs] (state: S, payload: string): void,
  [EMutations.addSearchConfigs] (state: S, payload: SearchConfigWithKey): void,
}

const mutations: MutationTree<SiteSettingsState> & Mutations = {
  [EMutations.initSiteSettings] (state, data) {
    state.enabledSites = data.enabledSites || []
    state.searchConfigs = data.searchConfigs || []
    state.concurrencyRequests = data.concurrencyRequests || 5
    state.expectTorrents = data.expectTorrents || 50
  },
  [EMutations.toggleEnabledSite] (state, site) {
    const index = state.enabledSites.findIndex(s => site === s)
    if (index !== -1) {
      state.enabledSites.splice(index, 1)
    } else {
      state.enabledSites.push(site)
    }
  },
  [EMutations.setConcurrencyRequests] (state, number) {
    state.concurrencyRequests = number
  },
  [EMutations.setExpectTorrents] (state, number) {
    state.expectTorrents = number
  },
  [EMutations.updateSearchConfigs] (state, searchConfigWithKey) {
    const index = state.searchConfigs.findIndex(config => config.key === searchConfigWithKey.key)
    if (index !== -1) {
      Object.assign(state.searchConfigs[index], searchConfigWithKey)
    }
  },
  [EMutations.deleteSearchConfigs] (state, key) {
    const index = state.searchConfigs.findIndex(config => config.key === key)
    if (index !== -1) {
      state.searchConfigs.splice(index, 1)
    }
  },
  [EMutations.addSearchConfigs] (state, searchConfigWithKey) {
    searchConfigWithKey.key = uuidv4()
    state.searchConfigs.push(searchConfigWithKey)
  }
}

// actions
type Actions<S = SiteSettingsState, R = RootState> = {
  [EActions.initSiteSettings] (context: ActionContext<S, R>): Promise<void>,
  [EActions.toggleEnabledSite] (context: ActionContext<S, R>, payload: {site: string}): Promise<void>,
  [EActions.setConcurrencyRequests] (context: ActionContext<S, R>, payload: {number: number}): Promise<void>,
  [EActions.setExpectTorrents] (context: ActionContext<S, R>, payload: {number: number}): Promise<void>,
  [EActions.updateSearchConfigs] (context: ActionContext<S, R>, payload: {searchConfigWithKey: SearchConfigWithKey}): Promise<void>,
  [EActions.deleteSearchConfigs] (context: ActionContext<S, R>, payload: {key: string}): Promise<void>,
  [EActions.addSearchConfigs] (context: ActionContext<S, R>, payload: {searchConfigWithKey: SearchConfigWithKey}): Promise<void>
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
  async [EActions.setConcurrencyRequests] ({ commit, state }, { number }) {
    commit(EMutations.setConcurrencyRequests, number)
    await siteSettingsStorage.set(state)
  },
  async [EActions.setExpectTorrents] ({ commit, state }, { number }) {
    commit(EMutations.setExpectTorrents, number)
    await siteSettingsStorage.set(state)
  },
  async [EActions.updateSearchConfigs] ({ commit, state }, { searchConfigWithKey }) {
    commit(EMutations.updateSearchConfigs, searchConfigWithKey)
    await siteSettingsStorage.set(state)
  },
  async [EActions.deleteSearchConfigs] ({ commit, state }, { key }) {
    commit(EMutations.deleteSearchConfigs, key)
    await siteSettingsStorage.set(state)
  },
  async [EActions.addSearchConfigs] ({ commit, state }, { searchConfigWithKey }) {
    commit(EMutations.addSearchConfigs, searchConfigWithKey)
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
