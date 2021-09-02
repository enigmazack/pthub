import { InjectionKey } from 'vue'
import { createStore, useStore as baseUseStore, Store } from 'vuex'
import trigger, { TriggerProps } from './modules/trigger'

export interface GlobalDataProps {
  trigger: TriggerProps
}

// eslint-disable-next-line symbol-description
export const key: InjectionKey<Store<GlobalDataProps>> = Symbol()

export const store = createStore<GlobalDataProps>({
  modules: {
    trigger
  }
})

// 定义自己的 `useStore` 组合式函数
export function useStore ():Store<GlobalDataProps> {
  return baseUseStore(key)
}
