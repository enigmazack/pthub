/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosResponse } from 'axios'
import $ from 'jquery'

export enum SiteCatagory {
  general = 'general',
  scene = 'scene',
  hd = 'hd',
  movies = 'movies',
  tv = 'tv',
  learning = 'learning',
  music = 'music',
  animation = 'animation',
  adult = 'adult',
  games = 'games',
  sports = 'sports',
  other = 'other'
}

export interface SiteConfig {
  name: string,
  url: string,
  abbreviation?: string,
  catagory?: SiteCatagory,
  tags?: SiteCatagory[],
}

export interface requestCache {
  url: string,
  response: Promise<AxiosResponse<any>>
  time: number
}

export interface userInfo {
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

export default class Site {
  name: string
  url: URL
  abbreviation: string
  catagory: SiteCatagory
  tags: SiteCatagory[]
  requestCache: requestCache[]

  constructor (config:SiteConfig) {
    this.name = config.name
    this.url = new URL(config.url)
    this.abbreviation = config.abbreviation || ''
    this.catagory = config.catagory || SiteCatagory.other
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
      baseURL: this.url.toString()
    })
    this.pushToRequestCache(url, r)
    return r
  }

  post<T = any> (url: string, data?: any): Promise<AxiosResponse<T>> {
    return axios.post(url, data, {
      baseURL: this.url.toString()
    })
  }

  cleanRequestCache () {
    this.requestCache = []
  }

  pushToRequestCache (url: string, response: Promise<AxiosResponse<any>>) {
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

  getFromRequestCache (url: string): requestCache | null {
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
    const sizeMatch = sizeString.match(/^(\d*\.?\d*) *([ZEPTGMK]?i?B$)/i)
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
