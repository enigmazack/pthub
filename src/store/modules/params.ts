/* eslint-disable @typescript-eslint/no-unused-vars */
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
  EMutations
} from '@/store/enum'
import { RootState } from '@/store'

// state
export interface ParamsState {
  searchText: string
  runSearch: boolean
}

const state: ParamsState = {
  searchText: '',
  runSearch: false
}

// getters
type Getters = {
}

const getters: GetterTree<ParamsState, RootState> & Getters = {
}

// mutations
type Mutations<S = ParamsState> = {
  [EMutations.setSearchText] (state: S, payload: string): void
  [EMutations.setRunSearch] (state: S, payload: boolean): void
}

const mutations: MutationTree<ParamsState> & Mutations = {
  [EMutations.setSearchText] (state, searchText) {
    state.searchText = searchText
  },
  [EMutations.setRunSearch] (state, run) {
    state.runSearch = run
  }
}

// actions
type Actions<S = ParamsState, R = RootState> = {
}

const actions: ActionTree<ParamsState, RootState> & Actions = {
}

// modules
const params: Module<ParamsState, RootState> = {
  state,
  getters,
  mutations,
  actions
}

export default params

// store type
export type ParamsStore<S = ParamsState> = Omit<Store<S>, 'getters' | 'commit' | 'dispatch'> & {
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
