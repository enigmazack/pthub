import type { GetterTree } from 'vuex'
import type { RootState } from '../root/state'
import { EGetters } from '../root/enum'
import type { State, UserData } from './state'

export interface Getters<S = State> {
  [EGetters.getUserData] (state: S): (siteKey: string) => UserData | undefined
}

const getters: GetterTree<State, RootState> & Getters = {
  [EGetters.getUserData](state) {
    return siteKey => state.userData.find(ud => ud.siteKey === siteKey)
  },
}

export default getters
