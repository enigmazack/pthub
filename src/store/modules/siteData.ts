import _ from 'lodash'
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
import { siteDataStorage } from '@/store/storage'
import { UserInfo } from '@/sites'

export interface UserData extends UserInfo {
  siteKey: string,
  recordDate: number
}

export interface SearchConfig {
  siteKey: string,
  name: string,
  pattern: string
}

// state
export interface SiteDataState {
  enabledSites: string[],
  userData: UserData[],
  searchConfigs: SearchConfig[]
}

const state: SiteDataState = {
  enabledSites: [],
  userData: [],
  searchConfigs: []
}

// getters
type Getters = {
}

const getters: GetterTree<SiteDataState, RootState> & Getters = {
}

// mutations
type Mutations<S = SiteDataState> = {
  [EMutations.initSiteData] (state: S, payload: S): void,
  [EMutations.toggleEnabledSite] (state: S, payload: string): void,
  [EMutations.updateUserData] (state: S, payload: UserData): void,
  [EMutations.updateSearchConfigs] (state: S, payload: SearchConfig): void
}

const mutations: MutationTree<SiteDataState> & Mutations = {
  [EMutations.initSiteData] (state, data) {
    state.enabledSites = data.enabledSites || []
    state.userData = data.userData || []
    state.searchConfigs = data.searchConfigs || []
  },
  [EMutations.toggleEnabledSite] (state, site) {
    const index = state.enabledSites.findIndex(s => site === s)
    if (index !== -1) {
      state.enabledSites.splice(index, 1)
    } else {
      state.enabledSites.push(site)
    }
  },
  [EMutations.updateUserData] (state, data) {
    const index = _.findIndex(state.userData, obj => obj.siteKey === data.siteKey)
    if (index === -1) {
      // insert data if the site key is new
      state.userData.push(data)
    } else {
      // update data
      state.userData[index] = data
    }
  },
  [EMutations.updateSearchConfigs] (state, searchConfig) {
    const index = _.findIndex(state.searchConfigs, obj =>
      obj.siteKey === searchConfig.siteKey && obj.name === searchConfig.name)
    if (index === -1) {
      state.searchConfigs.push(searchConfig)
    } else {
      state.searchConfigs[index] = searchConfig
    }
  }
}

// actions
type Actions<S = SiteDataState, R = RootState> = {
  [EActions.initSiteData] (context: ActionContext<S, R>): Promise<void>,
  [EActions.toggleEnabledSite] (context: ActionContext<S, R>, payload: {site: string}): Promise<void>,
  [EActions.updateUserData] (context: ActionContext<S, R>, payload: {data: UserData}): Promise<void>,
  [EActions.updateSearchConfigs] (context: ActionContext<S, R>, payload: {searchConfig: SearchConfig}): Promise<void>,
}

const actions: ActionTree<SiteDataState, RootState> & Actions = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async [EActions.initSiteData] ({ commit, state }) {
    // load data from the local storage when extension start
    const data = await siteDataStorage.get()
    if (data !== undefined) {
      commit(EMutations.initSiteData, data)
    } else {
      // for new installed extension, init the storage with empty data
      await siteDataStorage.set(state)
    }
  },
  async [EActions.toggleEnabledSite] ({ commit, state }, { site }) {
    commit(EMutations.toggleEnabledSite, site)
    await siteDataStorage.set(state)
  },
  async [EActions.updateUserData] ({ commit, state }, { data }) {
    commit(EMutations.updateUserData, data)
    await siteDataStorage.set(state)
  },
  async [EActions.updateSearchConfigs] ({ commit, state }, { searchConfig }) {
    commit(EMutations.updateSearchConfigs, searchConfig)
    await siteDataStorage.set(state)
  }
}

// modules
const siteData: Module<SiteDataState, RootState> = {
  state,
  getters,
  mutations,
  actions
}

export default siteData

// store type
export type SiteDataStore<S = SiteDataState> = Omit<Store<S>, 'getters' | 'commit' | 'dispatch'> & {
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
