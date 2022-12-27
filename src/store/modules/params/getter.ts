import type { GetterTree } from 'vuex'
import type { RootState } from '../root/state'
import type { State } from './state'

const getters: GetterTree<State, RootState> & Getters = {
}

export default getters

export interface Getters {
}
