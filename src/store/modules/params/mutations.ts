import type { MutationTree } from 'vuex'
import { EMutations } from '../root/enum'
import type { State } from './state'

export interface Mutations<S = State> {
  [EMutations.setSearchText] (state: S, payload: string): void
}

const mutations: MutationTree<State> & Mutations = {
  [EMutations.setSearchText](state, searchText) {
    state.searchText = searchText
  },
}

export default mutations
