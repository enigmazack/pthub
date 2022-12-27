/* eslint-disable @typescript-eslint/no-unused-vars */
import type { AxiosResponse } from 'axios'
import axios from 'axios'
import $ from 'jquery'
import { ESiteStatus } from '../enum'
import type { SiteConfig, TorrentInfo, UserInfo } from '../types'

export default class Site {
  name: string
  url: URL
  icon: URL
  private timeout = 10000

  constructor(config: SiteConfig) {
    this.name = config.name
    this.url = new URL(config.url)
    if (config.icon) {
      try {
        this.icon = new URL(config.icon)
      }
      catch {
        this.icon = new URL(this.url.href)
        this.icon.pathname = config.icon
      }
    }
    else {
      this.icon = new URL(this.url.href)
      this.icon.pathname = 'favicon.ico'
    }
  }

  async checkStatus(): Promise<ESiteStatus> {
    return ESiteStatus.error
  }

  async getUserInfo(): Promise<UserInfo | ESiteStatus> {
    return ESiteStatus.getUserDataFailed
  }

  async search(keywords: string, expectTorrents: number, pattern?: string): Promise<TorrentInfo[] | ESiteStatus> {
    return ESiteStatus.searchFailed
  }

  setTimeout(timeout: number): void {
    this.timeout = timeout
  }

  protected get(url: string): Promise<AxiosResponse<any>> {
    return axios.get(url, {
      baseURL: this.url.href,
      timeout: this.timeout,
    })
  }

  protected parseHTML(page: string): JQuery<Document> {
    const document = new DOMParser().parseFromString(page, 'text/html')
    const j = $(document)
    return j
  }

  protected async getAsQuery(url: string): Promise<JQuery<Document>> {
    // console.info(url)
    const r = await this.get(url)
    return this.parseHTML(r.data)
  }

  protected post(url: string, data: any): Promise<AxiosResponse<any>> {
    return axios.post(url, data, {
      baseURL: this.url.href,
      timeout: this.timeout,
    })
  }

  /**
   * find any matched element from the query by a selector list
   * @param query
   * @param selectorList
   * @returns
   */
  protected someSelector(query: JQuery<any>, selectorList: string[]): JQuery<any> {
    let r = query
    selectorList.some((selector) => {
      r = query.find(selector)
      return !!r.length
    })
    return r
  }

  /**
   * find max page number of pagination
   * @param query
   * @returns
   */
  protected parseMaxPage(query: JQuery<Document>): number {
    const aPages = query.find('a[href*="&page="]')
    let maxPage = 0
    for (let i = 0; i < aPages.length; i++) {
      const href = aPages.eq(i).attr('href')
      const pageMatch = href?.match(/page=(\d+)/)
      const page = pageMatch ? parseInt(pageMatch[1]) : 0
      if (page > maxPage)
        maxPage = page
    }
    return maxPage
  }

  protected parseUrlPath(path: string): URL {
    const url = new URL(this.url.href)
    const [pathname, search] = path.split('?')
    url.pathname = pathname
    url.search = search
    return url
  }

  /**
   * parse something with pagination, like the search result and seeding torrents
   * USE arrow function to define parseFunction, otherwise 'this' will be unreachable
   * @param path
   * @param parseFunction
   * @param start start index of pagination, 0 or 1, depends on the site
   * @param maxCounts
   * @returns
   */
  protected async parsePagination<T>(
    path: string,
    parseFunction: (query: JQuery<Document>) => T[],
    start: 0 | 1,
    maxCounts?: number,
  ): Promise<T[]> {
    const url = this.parseUrlPath(path)
    const qStart = await this.getAsQuery(url.pathname + url.search)
    const maxPage = this.parseMaxPage(qStart)
    // console.log('maxPage: ' + maxPage)
    let list = parseFunction(qStart)
    let currentPage = start
    while (currentPage < maxPage) {
      currentPage += 1
      if (maxCounts && maxCounts <= list.length)
        break
      url.searchParams.set('page', currentPage.toString())
      const qNext = await this.getAsQuery(url.pathname + url.search)
      const addition = parseFunction(qNext)
      list = list.concat(addition)
    }
    return list
  }
}
