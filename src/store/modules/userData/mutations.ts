import type { MutationTree } from 'vuex'
import { EMutations } from '../root/enum'
import type { State, UserData } from './state'

export interface Mutations<S = State> {
  [EMutations.initUserData] (state: S, payload: S): void
  [EMutations.updateUserData] (state: S, payload: UserData): void
}

const mutations: MutationTree<State> & Mutations = {
  [EMutations.initUserData](state, data) {
    state.userData = data.userData || []
  },
  [EMutations.updateUserData](state, data) {
    const index = state.userData.findIndex(uData => uData.siteKey === data.siteKey)
    if (index === -1) {
      // insert data if the site key is new
      state.userData.push(data)
    }
    else {
      // update data
      state.userData[index] = data
    }
  },
}

export default mutations

