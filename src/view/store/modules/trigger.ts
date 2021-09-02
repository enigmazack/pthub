import {
  Module,
  MutationTree
} from 'vuex'
import { GlobalDataProps } from '../index'

export interface TriggerProps {
  collapsed: boolean
}

const state: TriggerProps = {
  collapsed: false
}

type Mutations<S = TriggerProps> = {
  toggleCollapsed (state: S): void
}

const mutations: MutationTree<TriggerProps> & Mutations = {
  toggleCollapsed (state) {
    state.collapsed = !state.collapsed
  }
}

const trigger: Module<TriggerProps, GlobalDataProps> = {
  state,
  mutations
}

export default trigger
