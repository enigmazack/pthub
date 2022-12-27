import type { MutationTree } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import { EMutations } from '../root/enum'
import type { SearchConfigWithKey, State } from './state'

export interface Mutations<S = State> {
  [EMutations.initSiteSettings] (state: S, payload: S): void
  [EMutations.toggleEnabledSite] (state: S, payload: string): void
  [EMutations.setConcurrencyRequests] (state: S, payload: number): void
  [EMutations.setExpectTorrents] (state: S, payload: number): void
  [EMutations.updateSearchConfigs] (state: S, payload: SearchConfigWithKey): void
  [EMutations.deleteSearchConfigs] (state: S, payload: string): void
  [EMutations.addSearchConfigs] (state: S, payload: SearchConfigWithKey): void
  [EMutations.setSelectedConfig] (state: S, payload: string): void
  [EMutations.setTimeout] (state: S, payload: number): void
}

const mutations: MutationTree<State> & Mutations = {
  [EMutations.initSiteSettings](state, data) {
    state.enabledSites = data.enabledSites || []
    state.searchConfigs = data.searchConfigs || []
    state.concurrencyRequests = data.concurrencyRequests || 5
    state.expectTorrents = data.expectTorrents || 50
    state.selectedConfig = data.selectedConfig || 'default'
    state.timeout = data.timeout || 5000
  },
  [EMutations.toggleEnabledSite](state, site) {
    const index = state.enabledSites.findIndex(s => site === s)
    if (index !== -1)
      state.enabledSites.splice(index, 1)

    else
      state.enabledSites.push(site)
  },
  [EMutations.setConcurrencyRequests](state, number) {
    state.concurrencyRequests = number
  },
  [EMutations.setExpectTorrents](state, number) {
    state.expectTorrents = number
  },
  [EMutations.updateSearchConfigs](state, searchConfigWithKey) {
    const index = state.searchConfigs.findIndex(config => config.key === searchConfigWithKey.key)
    if (index !== -1)
      Object.assign(state.searchConfigs[index], searchConfigWithKey)
  },
  [EMutations.deleteSearchConfigs](state, key) {
    const index = state.searchConfigs.findIndex(config => config.key === key)
    if (index !== -1)
      state.searchConfigs.splice(index, 1)
  },
  [EMutations.addSearchConfigs](state, searchConfigWithKey) {
    searchConfigWithKey.key = uuidv4()
    state.searchConfigs.push(searchConfigWithKey)
  },
  [EMutations.setSelectedConfig](state, configName) {
    state.selectedConfig = configName
  },
  [EMutations.setTimeout](state, timeout) {
    state.timeout = timeout
  },
}

export default mutations

