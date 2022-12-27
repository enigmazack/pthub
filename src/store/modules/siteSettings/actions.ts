import type { ActionContext, ActionTree } from 'vuex'
import type { RootState } from '../root/state'
import { EActions, EMutations } from '../root/enum'
import { siteSettingsStorage } from '../../storage'
import type { SearchConfigWithKey, State } from './state'

export interface Actions<S = State, R = RootState> {
  [EActions.initSiteSettings] (context: ActionContext<S, R>, payload: { siteList: string[]; data?: State }): Promise<void>
  [EActions.toggleEnabledSite] (context: ActionContext<S, R>, payload: { site: string }): Promise<void>
  [EActions.setConcurrencyRequests] (context: ActionContext<S, R>, payload: { number: number }): Promise<void>
  [EActions.setExpectTorrents] (context: ActionContext<S, R>, payload: { number: number }): Promise<void>
  [EActions.updateSearchConfigs] (context: ActionContext<S, R>, payload: { searchConfigWithKey: SearchConfigWithKey }): Promise<void>
  [EActions.deleteSearchConfigs] (context: ActionContext<S, R>, payload: { key: string }): Promise<void>
  [EActions.addSearchConfigs] (context: ActionContext<S, R>, payload: { searchConfigWithKey: SearchConfigWithKey }): Promise<void>
  [EActions.setSelectedConfig] (context: ActionContext<S, R>, payload: { configName: string }): Promise<void>
  [EActions.setTimeout] (context: ActionContext<S, R>, payload: { timeout: number }): Promise<void>
}

const actions: ActionTree<State, RootState> & Actions = {
  async [EActions.initSiteSettings]({ commit, state }, { siteList, data }) {
    // load data from the local storage when extension start
    if (!data)
      data = await siteSettingsStorage.get()

    if (data !== undefined) {
      // Omit useless record
      data.enabledSites = data.enabledSites.filter(
        siteKey => siteList.findIndex(sKey => sKey === siteKey) !== -1,
      )
      data.searchConfigs = data.searchConfigs.filter(
        sConfig => siteList.findIndex(sKey => sKey === sConfig.siteKey) !== -1,
      )
      commit(EMutations.initSiteSettings, data)
    }
    await siteSettingsStorage.set(state)
  },
  async [EActions.toggleEnabledSite]({ commit, state }, { site }) {
    commit(EMutations.toggleEnabledSite, site)
    await siteSettingsStorage.set(state)
  },
  async [EActions.setConcurrencyRequests]({ commit, state }, { number }) {
    commit(EMutations.setConcurrencyRequests, number)
    await siteSettingsStorage.set(state)
  },
  async [EActions.setExpectTorrents]({ commit, state }, { number }) {
    commit(EMutations.setExpectTorrents, number)
    await siteSettingsStorage.set(state)
  },
  async [EActions.updateSearchConfigs]({ commit, state }, { searchConfigWithKey }) {
    commit(EMutations.updateSearchConfigs, searchConfigWithKey)
    await siteSettingsStorage.set(state)
  },
  async [EActions.deleteSearchConfigs]({ commit, state }, { key }) {
    commit(EMutations.deleteSearchConfigs, key)
    await siteSettingsStorage.set(state)
  },
  async [EActions.addSearchConfigs]({ commit, state }, { searchConfigWithKey }) {
    commit(EMutations.addSearchConfigs, searchConfigWithKey)
    await siteSettingsStorage.set(state)
  },
  async [EActions.setSelectedConfig]({ commit, state }, { configName }) {
    commit(EActions.setSelectedConfig, configName)
    await siteSettingsStorage.set(state)
  },
  async [EActions.setTimeout]({ commit, state }, { timeout }) {
    commit(EMutations.setTimeout, timeout)
    await siteSettingsStorage.set(state)
  },
}

export default actions
