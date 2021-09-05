import { Module } from 'vuex'
import { GlobalData } from './index'
import sites, { ESiteStatus } from '@/sites'

export interface SiteStatus {
  [key: string]: ESiteStatus
}

interface SetPayload {
  site: string,
  status: ESiteStatus
}

const state: SiteStatus = {}

for (const siteKey of Object.keys(sites)) {
  state[siteKey] = ESiteStatus.unknow
}

const siteStatus: Module<SiteStatus, GlobalData> = {
  state,
  mutations: {
    setSiteStatus (state, payload: SetPayload) {
      state[payload.site] = payload.status
    }
  },
  actions: {
    getSiteStatus ({ commit, state }) {
      Object.keys(state).forEach(async key => {
        commit('setSiteStatus', { site: key, status: ESiteStatus.connecting })
        const newStatus = await sites[key].checkStatus()
        commit('setSiteStatus', { site: key, status: newStatus })
      })
    }
  }
}

export default siteStatus
