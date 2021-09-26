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
  EMutations,
  EActions,
  EGetters
} from '@/store/enum'
import { RootState } from '@/store'
import { userDataStorage } from '@/store/storage'
import { UserInfo } from '@/sites'

export interface UserData extends UserInfo {
  siteKey: string,
  recordDate: number
}

// state
export interface UserDataState {
  userData: UserData[],
}

const state: UserDataState = {
  userData: []
}

// getters
type Getters<S = UserDataState> = {
  [EGetters.getUserData] (state: S): (siteKey: string) => UserData | undefined
}

const getters: GetterTree<UserDataState, RootState> & Getters = {
  [EGetters.getUserData] (state) {
    return (siteKey) => state.userData.find(ud => ud.siteKey === siteKey)
  }
}

// mutations
type Mutations<S = UserDataState> = {
  [EMutations.initUserData] (state: S, payload: S): void,
  [EMutations.updateUserData] (state: S, payload: UserData): void,

}

const mutations: MutationTree<UserDataState> & Mutations = {
  [EMutations.initUserData] (state, data) {
    state.userData = data.userData || []
  },
  [EMutations.updateUserData] (state, data) {
    const index = state.userData.findIndex(uData => uData.siteKey === data.siteKey)
    if (index === -1) {
      // insert data if the site key is new
      state.userData.push(data)
    } else {
      // update data
      state.userData[index] = data
    }
  }
}

// actions
type Actions<S = UserDataState, R = RootState> = {
  [EActions.initUserData] (context: ActionContext<S, R>, payload: {siteList: string[], data?: UserDataState}): Promise<void>,
  [EActions.updateUserData] (context: ActionContext<S, R>, payload: {data: UserData}): Promise<void>,
}

const actions: ActionTree<UserDataState, RootState> & Actions = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async [EActions.initUserData] ({ commit, state }, { siteList, data }) {
    // load data from the local storage when extension start
    if (!data) {
      data = await userDataStorage.get()
    }
    if (data !== undefined) {
      data.userData = data.userData.filter(
        uData => siteList.findIndex(sKey => sKey === uData.siteKey) !== -1
      )
      commit(EMutations.initUserData, data)
    }
    await userDataStorage.set(state)
  },
  async [EActions.updateUserData] ({ commit, state }, { data }) {
    commit(EMutations.updateUserData, data)
    await userDataStorage.set(state)
  }
}

// modules
const userData: Module<UserDataState, RootState> = {
  state,
  getters,
  mutations,
  actions
}

export default userData

// store type
export type UserDataStore<S = UserDataState> = Omit<Store<S>, 'getters' | 'commit' | 'dispatch'> & {
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
