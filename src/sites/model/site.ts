/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosResponse } from 'axios'
import $ from 'jquery'
import { ESiteStatus } from '../enum'
import type {
  UserInfo,
  SiteConfig,
  TorrentInfo
} from '../types'

export default class Site {
  name: string
  url: URL
  icon: URL
  private timeout = 5000

  constructor (config:SiteConfig) {
    this.name = config.name
    this.url = new URL(config.url)
    if (config.icon) {
      try {
        this.icon = new URL(config.icon)
      } catch {
        this.icon = new URL(this.url.href)
        this.icon.pathname = config.icon
      }
    } else {
      this.icon = new URL(this.url.href)
      this.icon.pathname = 'favicon.ico'
    }
  }

  async checkStatus (): Promise<ESiteStatus> {
    return ESiteStatus.error
  }

  async getUserInfo (): Promise<UserInfo|ESiteStatus> {
    return ESiteStatus.getUserDataFailed
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async search (keywords: string, expectTorrents: number, pattern?: string): Promise<TorrentInfo[]|ESiteStatus> {
    return ESiteStatus.searchFailed
  }

  get (url: string): Promise<AxiosResponse<any>> {
    const r = axios.get(url, {
      baseURL: this.url.href,
      timeout: this.timeout
    })
    return r
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  post (url: string, data: any): Promise<AxiosResponse<any>> {
    return axios.post(url, data, {
      baseURL: this.url.href,
      timeout: this.timeout
    })
  }

  setTimeout (timeout: number): void {
    this.timeout = timeout
  }

  protected parseHTML (page: string): JQuery<Document> {
    const document = new DOMParser().parseFromString(page, 'text/html')
    const j = $(document)
    return j
  }

  protected someSelector (query: JQuery<any>, selectorList: string[]): JQuery<any> {
    let r = query
    selectorList.some(selector => {
      r = query.find(selector)
      return !!r.length
    })
    return r
  }

  protected parseSize (sizeString: string): number {
    const sizeMatch = sizeString.match(/^(\d+\.?\d*).*?([ZEPTGMK]?i?B$)/i)
    if (sizeMatch) {
      const sizeNumber = parseFloat(sizeMatch[1])
      const sizeUnit = sizeMatch[2]
      switch (true) {
        case /Zi?B/i.test(sizeUnit):
          return sizeNumber * Math.pow(2, 70)
        case /Ei?B/i.test(sizeUnit):
          return sizeNumber * Math.pow(2, 60)
        case /Pi?B/i.test(sizeUnit):
          return sizeNumber * Math.pow(2, 50)
        case /Ti?B/i.test(sizeUnit):
          return sizeNumber * Math.pow(2, 40)
        case /Gi?B/i.test(sizeUnit):
          return sizeNumber * Math.pow(2, 30)
        case /Mi?B/i.test(sizeUnit):
          return sizeNumber * Math.pow(2, 20)
        case /Ki?B/i.test(sizeUnit):
          return sizeNumber * Math.pow(2, 10)
        default:
          return sizeNumber
      }
    }
    return 0
  }
}
