import type { ActionTree } from 'vuex'
import type { RootState } from '../root/state'
import type { State } from './state'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Actions<S = State, R = RootState> {
}

const actions: ActionTree<State, RootState> & Actions = {
}

export default actions
