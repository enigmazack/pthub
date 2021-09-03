import { Module } from 'vuex'
import { GlobalDataProps } from './index'
import { uiSettingsStorage } from '../api/storage'

export interface UISettings {
  siderCollapsed: boolean
}

const uiSettings: Module<UISettings, GlobalDataProps> = {
  state: {
    siderCollapsed: false
  },
  mutations: {
    toggleSiderCollapsed (state) {
      state.siderCollapsed = !state.siderCollapsed
    },
    setSiderCollapsed (state, value: boolean) {
      state.siderCollapsed = value
    }
  },
  actions: {
    async getSiderCollapsed ({ commit, state }) {
      const data = await uiSettingsStorage.get()
      if (data !== undefined) {
        commit('setSiderCollapsed', data.siderCollapsed)
      } else {
        await uiSettingsStorage.set(state)
      }
    },
    async toggleSiderCollapsed ({ commit, state }) {
      commit('toggleSiderCollapsed')
      await uiSettingsStorage.set(state)
    }
  }
}

export default uiSettings
