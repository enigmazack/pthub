/* eslint-disable @typescript-eslint/no-unused-vars */
import { ESiteStatus, ETorrentCatagory } from '../enum'
import type { SeedingInfo, TorrentInfo, TorrentPromotion, UserInfo } from '../types'
import Site from './site'

export default class CommonSite extends Site {
  protected userId = ''
  protected indexPath = ''
  protected userIdRegex = /.*/
  protected userPath = '/'
  protected defaultSearchPattern = ''
  protected paginationStartIndex: 0 | 1 = 0

  async checkStatus(): Promise<ESiteStatus> {
    try {
      let isLogin = false
      const r = await this.get(this.indexPath)
      if (r.request && r.request.responseURL)
        isLogin = r.request.responseURL.includes(this.indexPath)

      return isLogin ? ESiteStatus.login : ESiteStatus.logout
    }
    catch (error) {
      if (error instanceof Error && error.message.includes('timeout'))
        return ESiteStatus.timeout

      return ESiteStatus.error
    }
  }

  protected async getUserId(): Promise<void> {
    if (!this.userId) {
      const r = await this.get(this.indexPath)
      const idMatch = r.data.match(this.userIdRegex)
      const id = idMatch ? idMatch[1] : ''
      this.userId = id
    }
  }

  async getUserInfo(): Promise<UserInfo | ESiteStatus> {
    try {
      await this.getUserId()
      if (!this.userId)
        return ESiteStatus.getUserIdFailed

      const url = new URL(this.url.href)
      url.pathname = this.userPath
      url.searchParams.set('id', this.userId)
      const query = await this.getAsQuery(url.pathname + url.search)
      const name = this.parseUserName(query)
      const joinDate = this.parseJoinDate(query)
      const upload = this.parseUpload(query)
      const download = this.parseDownload(query)
      const userClass = this.parseUserClass(query)
      const bonus = this.parseBonus(query)
      const seedingInfo = await this.getSeedingInfo(query)
      return {
        name,
        id: this.userId,
        joinDate,
        upload,
        download,
        bonus,
        userClass,
        ...seedingInfo,
      }
    }
    catch (error) {
      console.error(`${this.name}: getUserInfo`, error)
      if (error instanceof Error && error.message.includes('timeout'))
        return ESiteStatus.timeout

      console.error(error)
      return ESiteStatus.getUserDataFailed
    }
  }

  protected parseUserName(query: JQuery<Document>): string {
    return ''
  }

  protected parseJoinDate(query: JQuery<Document>): number {
    return 0
  }

  protected parseUpload(query: JQuery<Document>): number {
    return 0
  }

  protected parseDownload(query: JQuery<Document>): number {
    return 0
  }

  protected parseUserClass(query: JQuery<Document>): string {
    return ''
  }

  protected parseBonus(query: JQuery<Document>): number {
    return -1
  }

  protected async getSeedingInfo(query: JQuery<Document>): Promise<SeedingInfo> {
    return { seeding: 0, seedingSize: 0, seedingList: [] }
  }

  async search(keywords: string, expectTorrents: number, pattern?: string): Promise<TorrentInfo[] | ESiteStatus> {
    try {
      if (!pattern)
        pattern = this.defaultSearchPattern

      const path = pattern.replace('{}', keywords.replaceAll('.', ' '))
      const torrents = await this.parsePagination(path, this.parseTorrentPage, this.paginationStartIndex, expectTorrents)
      return torrents
    }
    catch (error) {
      console.error(`${this.name}: search`, error)
      if (error instanceof Error && error.message.includes('timeout'))
        return ESiteStatus.timeout

      return ESiteStatus.searchFailed
    }
  }

  protected parseTorrentPage = (query: JQuery<Document>): TorrentInfo[] => {
    const torrents: TorrentInfo[] = []
    const rows = this.findTorrentRows(query)
    for (let i = 0; i < rows.length; i++) {
      const row = rows.eq(i)
      const catagory = this.parseTorrentCatagory(row)
      const id = this.parseTorrentId(row)
      const detailUrl = this.parseTorrentDetailsUrl(row)
      const downloadUrl = this.parseTorrentDownloadUrl(row)
      const title = this.parseTorrentTitle(row)
      const subTitle = this.parseTorrentSubTitle(row)
      const releaseDate = this.parseTorrentReleaseDate(row)
      const size = this.parseTorrentSize(row)
      const seeders = this.parseTorrentSeeders(row)
      const leechers = this.parseTorrentLeechers(row)
      const snatched = this.parseTorrentSnatched(row)
      const seeding = this.parseTorrentSeeding(row)
      const promotion = this.parseTorrentPromotion(row)
      const data = {
        id,
        title,
        subTitle,
        detailUrl,
        downloadUrl,
        size,
        seeders,
        leechers,
        snatched,
        releaseDate,
        catagory,
        seeding,
        promotion,
      }
      torrents.push(data)
    }
    return torrents
  }

  protected parseTorrentCatagoryKey = (query: JQuery<HTMLElement>): string | undefined => {
    return ''
  }

  protected parseTorrentCatagory = (query: JQuery<HTMLElement>): ETorrentCatagory => {
    return ETorrentCatagory.undefined
  }

  protected parseTorrentSeeding = (query: JQuery<HTMLElement>): boolean | undefined => {
    return undefined
  }

  protected parseTorrentPromotion = (query: JQuery<HTMLElement>): TorrentPromotion | undefined => {
    return undefined
  }

  protected parseTorrentId = (query: JQuery<HTMLElement>): string => {
    return ''
  }

  protected parseTorrentTitle = (query: JQuery<HTMLElement>): string => {
    return ''
  }

  protected parseTorrentSubTitle = (query: JQuery<HTMLElement>): string | undefined => {
    return ''
  }

  protected parseTorrentReleaseDate = (query: JQuery<HTMLElement>): number => {
    return 0
  }

  protected parseTorrentSize = (query: JQuery<HTMLElement>): number => {
    return -1
  }

  protected parseTorrentSeeders = (query: JQuery<HTMLElement>): number => {
    return -1
  }

  protected parseTorrentLeechers = (query: JQuery<HTMLElement>): number => {
    return -1
  }

  protected parseTorrentSnatched = (query: JQuery<HTMLElement>): number => {
    return NaN
  }

  protected parseTorrentDetailsUrl = (query: JQuery<HTMLElement>): string => {
    return ''
  }

  protected parseTorrentDownloadUrl = (query: JQuery<HTMLElement>): string => {
    return ''
  }

  protected findTorrentRows = (query: JQuery<Document>): JQuery<HTMLElement> => {
    return query.find('table.torrents > tbody > tr')
  }
}
