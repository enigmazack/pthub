import { Module } from 'vuex'
import { GlobalDataProps } from './index'
import { UserInfo } from '@/sites/model/site'

interface UserData extends UserInfo{
  site: string
}

interface UserDataProps {
  userData: UserData[]
}

const trigger: Module<UserDataProps, GlobalDataProps> = {
  state: {
    userData: []
  },
  mutations: {
  },
  actions: {
  }
}

export default trigger
