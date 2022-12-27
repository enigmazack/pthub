import type { ActionContext, ActionTree } from 'vuex'
import type { RootState } from '../root/state'
import { EActions, EMutations } from '../root/enum'
import { userDataStorage } from '../../storage'
import type { State, UserData } from './state'

export interface Actions<S = State, R = RootState> {
  [EActions.initUserData] (context: ActionContext<S, R>, payload: { siteList: string[]; data?: State }): Promise<void>
  [EActions.updateUserData] (context: ActionContext<S, R>, payload: { data: UserData }): Promise<void>
}

const actions: ActionTree<State, RootState> & Actions = {
  async [EActions.initUserData]({ commit, state }, { siteList, data }) {
    // load data from the local storage when extension start
    if (!data)
      data = await userDataStorage.get()

    if (data !== undefined) {
      data.userData = data.userData.filter(
        uData => siteList.findIndex(sKey => sKey === uData.siteKey) !== -1,
      )
      commit(EMutations.initUserData, data)
    }
    await userDataStorage.set(state)
  },
  async [EActions.updateUserData]({ commit, state }, { data }) {
    commit(EMutations.updateUserData, data)
    await userDataStorage.set(state)
  },
}

export default actions
