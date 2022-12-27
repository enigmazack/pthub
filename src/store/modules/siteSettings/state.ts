export interface SearchConfig {
  siteKey: string
  name: string
  pattern: string
}

export interface SearchConfigWithKey extends SearchConfig {
  key: string
}

// state
export interface State {
  concurrencyRequests: number
  expectTorrents: number
  enabledSites: string[]
  searchConfigs: SearchConfigWithKey[]
  selectedConfig: string
  timeout: number
}

const state: State = {
  concurrencyRequests: 5,
  expectTorrents: 50,
  enabledSites: [],
  searchConfigs: [],
  selectedConfig: 'default',
  timeout: 5000,
}

export default state
