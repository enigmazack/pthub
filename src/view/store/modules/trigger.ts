import { Module } from 'vuex'
import { GlobalDataProps } from '../index'

export interface TriggerProps {
  collapsed: boolean
}

const trigger: Module<TriggerProps, GlobalDataProps> = {
  state: {
    collapsed: false
  },
  mutations: {
    toggleCollapsed (state) {
      state.collapsed = !state.collapsed
    }
  }
}

export default trigger
