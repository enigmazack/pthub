import { InjectionKey } from 'vue'
import { createStore, useStore as baseUseStore, Store } from 'vuex'

export interface State {
  collapsed: boolean
}

// eslint-disable-next-line symbol-description
export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state: {
    collapsed: false
  },
  mutations: {
    toggleCollapsed (state) {
      // 变更状态
      state.collapsed = !state.collapsed
    }
  }
})

// 定义自己的 `useStore` 组合式函数
export function useStore ():Store<State> {
  return baseUseStore(key)
}
