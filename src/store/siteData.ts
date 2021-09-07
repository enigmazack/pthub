import { Module } from 'vuex'
import { RootState } from '.'
import { siteDataStorage } from '@/api/storage'

export interface SiteDataState {
  enabled: string[]
}

const siteData: Module<SiteDataState, RootState> = {
  state: {
    enabled: []
  },
  mutations: {
    toggleEnabledSite (state, site: string) {
      const index = state.enabled.findIndex(s => site === s)
      if (index !== -1) {
        state.enabled.splice(index, 1)
      } else {
        state.enabled.push(site)
      }
    },
    setEnabledSite (state, sites: string[]) {
      state.enabled = sites
    }
  },
  actions: {
    async getEnabledSite ({ commit, state }) {
      const data = await siteDataStorage.get()
      if (data !== undefined) {
        commit('setEnabledSite', data.enabled)
      } else {
        await siteDataStorage.set(state)
      }
    },
    async toggleEnabledSite ({ commit, state }, payload) {
      commit('toggleEnabledSite', payload.site)
      await siteDataStorage.set(state)
    }
  }
}

export default siteData
