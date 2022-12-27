import type { UserInfo } from '~/sites'

export interface UserData extends UserInfo {
  siteKey: string
  recordDate: number
}

// state
export interface State {
  userData: UserData[]
}

const state: State = {
  userData: [],
}

export default state
