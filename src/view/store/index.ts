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

export function useStore ():Store<GlobalDataProps> {
  return baseUseStore(key)
}
