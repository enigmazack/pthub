/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'

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

export default class Site {
  name: string
  url: URL
  abbreviation: string
  catagory: SiteCatagory
  tags: SiteCatagory[]

  constructor (config:SiteConfig) {
    this.name = config.name
    this.url = new URL(config.url)
    this.abbreviation = config.abbreviation || ''
    this.catagory = config.catagory || SiteCatagory.other
    this.tags = config.tags || []
  }

  async get<T = any, R = AxiosResponse<T>> (url: string, config?: AxiosRequestConfig): Promise<R> {
    if (config) {
      return await axios.get(url, config)
    } else {
      return await axios.get(url, {
        baseURL: this.url.toString()
      })
    }
  }

  async post<T = any, R = AxiosResponse<T>> (url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
    if (config) {
      return await axios.post(url, data, config)
    } else {
      return await axios.post(url, data, {
        baseURL: this.url.toString()
      })
    }
  }
}
