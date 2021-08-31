/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosResponse } from 'axios'
import $ from 'jquery'
import {
  ETorrentCatagory,
  ETorrentPromotion,
  ESiteCatagory
} from './enum'

export { ESiteCatagory }

export interface SiteConfig {
  name: string,
  url: string,
  abbreviation?: string,
  catagory?: ESiteCatagory,
  tags?: ESiteCatagory[],
}

export interface RequestCache {
  url: string,
  response: Promise<AxiosResponse<any>>
  time: number
}

export interface UserInfo {
  name: string,
  id?: string,
  joinDate?: number,
  upload?: number,
  download?: number,
  ratio?: number,
  userClass?: string,
  bonus?: number,
  seeding?: number,
  seedingSize?: number,
  seedingList?: string[]
}

export interface SeedingInfo {
  seeding: number,
  seedingSize: number,
  seedingList?: string[]
}

export interface TorrentPromotion {
  status: ETorrentPromotion,
  type: 'temporary'|'permanent'
  expire?: number
}

export interface TorrentInfo {
  id: string,
  downloadUrl: string,
  detailUrl: string,
  title: string,
  releaseDate: number,
  subTitle?: string,
  catagory?: ETorrentCatagory,
  size: number,
  seeders: number,
  leechers: number,
  seeding?: boolean,
  promotion?: TorrentPromotion,
}

interface SearchConfigParams {
  [key: string]: string
}

export interface SearchConfig {
  path?: string,
  params?: SearchConfigParams,
  maxWanted?: number
}

export default class Site {
  name: string
  url: URL
  abbreviation: string
  catagory: ESiteCatagory
  tags: ESiteCatagory[]
  requestCache: RequestCache[]

  constructor (config:SiteConfig) {
    this.name = config.name
    this.url = new URL(config.url)
    this.abbreviation = config.abbreviation || ''
    this.catagory = config.catagory || ESiteCatagory.other
    this.tags = config.tags || []
    this.requestCache = []
  }

  get<T = any> (url: string, useCache = true): Promise<AxiosResponse<T>> {
    if (useCache) {
      const requestCache = this.getFromRequestCache(url)
      if (requestCache) {
        return requestCache.response
      }
    }
    const r = axios.get(url, {
      baseURL: this.url.href
    })
    this.pushToRequestCache(url, r)
    return r
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  post<T = any> (url: string, data: any): Promise<AxiosResponse<T>> {
    return axios.post(url, data, {
      baseURL: this.url.href
    })
  }

  protected cleanRequestCache (): void {
    this.requestCache = []
  }

  private pushToRequestCache (url: string, response: Promise<AxiosResponse<any>>) {
    const time = Date.now()
    for (let i = 0; i < this.requestCache.length; i++) {
      const cache = this.requestCache[i]
      if (cache.url === url) {
        this.requestCache.splice(i, 1)
        break
      }
    }
    const l = this.requestCache.unshift({ url, response, time })
    // cache only 10 request history
    if (l > 10) {
      this.requestCache.pop()
    }
  }

  private getFromRequestCache (url: string): RequestCache | null {
    const now = Date.now()
    for (let i = 0; i < this.requestCache.length; i++) {
      const cache = this.requestCache[i]
      if (cache.url === url && now - cache.time < 10 * 60 * 1000) {
        return cache
      }
    }
    return null
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

  protected genTorrentPromotion (status: ETorrentPromotion, expire?: number): TorrentPromotion {
    if (expire) {
      return { status, expire, type: 'temporary' }
    } else {
      return { status, type: 'permanent' }
    }
  }
}
