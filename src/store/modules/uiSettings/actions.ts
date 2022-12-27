import type { ActionContext, ActionTree } from 'vuex'
import type { RootState } from '../root/state'
import { EActions, EMutations } from '../root/enum'
import { uiSettingsStorage } from '../../storage'
import type { State } from './state'

export interface Actions<S = State, R = RootState> {
  [EActions.initUiSettings] (context: ActionContext<S, R>): Promise<void>
  [EActions.toggleSiderCollapsed] (context: ActionContext<S, R>): Promise<void>
  [EActions.setLocale] (context: ActionContext<S, R>, payload: { locale: string }): Promise<void>
}

const actions: ActionTree<State, RootState> & Actions = {
  async [EActions.initUiSettings]({ commit, state }) {
    const data = await uiSettingsStorage.get()
    if (data !== undefined)
      commit(EMutations.initUiSettings, data)
    else
      await uiSettingsStorage.set(state)
  },
  async [EActions.toggleSiderCollapsed]({ commit, state }) {
    commit(EMutations.toggleSiderCollapsed)
    await uiSettingsStorage.set(state)
  },
  async [EActions.setLocale]({ commit, state }, { locale }) {
    commit(EMutations.setLocale, locale)
    await uiSettingsStorage.set(state)
  },
}

export default actions

