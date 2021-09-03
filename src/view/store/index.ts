import { InjectionKey } from 'vue'
import { createStore, useStore as baseUseStore, Store } from 'vuex'
import uiSettings, { UISettings } from './uiSettings'

export interface GlobalDataProps {
  uiSettings: UISettings
}

// eslint-disable-next-line symbol-description
export const key: InjectionKey<Store<GlobalDataProps>> = Symbol()

export const store = createStore<GlobalDataProps>({
  modules: {
    uiSettings
  }
})

export function useStore ():Store<GlobalDataProps> {
  return baseUseStore(key)
}
