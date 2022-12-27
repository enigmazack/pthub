/* eslint-disable @typescript-eslint/no-unused-vars */
import { ESiteStatus, ETorrentCatagory } from '../enum'
import type { SeedingInfo, TorrentInfo, TorrentPromotion, UserInfo } from '../types'
import { parseSize } from '../utils'
import Site from './site'

export default class GazelleSite extends Site {
  protected userId = ''
  protected tableIndex = {
    size: 4,
    seeders: 6,
    leechers: 7,
    snatched: 5,
  }

  async checkStatus(): Promise<ESiteStatus> {
    try {
      let isLogin = false
      const r = await this.get('/index.php')
      if (r.request && r.request.responseURL)
        isLogin = r.request.responseURL.match(/index\.php/)

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
      const r = await this.get('/index.php')
      const idMatch = r.data.match(/user.php\?id=(\d+)/)
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
      url.pathname = '/user.php'
      url.searchParams.set('id', this.userId)
      const query = await this.getAsQuery(url.pathname + url.search)
      const name = this.parseUserName(query)
      const joinDate = this.parseJoinDate(query)
      const upload = this.parseUpload(query)
      const download = this.parseDownload(query)
      const userClass = this.parseUserClass(query)
      const bonus = this.parseBonus(query)
      const seedingInfo = await this.getSeedingInfo()
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
    const name = query.find('a[href*="user.php?id="]').first().text()
    return name
  }

  protected parseJoinDate(query: JQuery<Document>): number {
    const joinDateString = query.find('li:contains("Joined")').find('> span').attr('title')
    const joinDate = joinDateString ? Date.parse(joinDateString) : 0
    return joinDate
  }

  protected parseUserClass(query: JQuery<Document>): string {
    const userClass = query.find('li:contains("Class")').text().split(':')[1].trim() || ''
    return userClass
  }

  protected parseUpload(query: JQuery<Document>): number {
    const uploadString = query.find('li:contains("Uploaded:")')
      .first().text().split(':')[1].trim()
    const upload = parseSize(uploadString)
    return upload
  }

  protected parseDownload(query: JQuery<Document>): number {
    const downloadString = query.find('li:contains("Downloaded:")')
      .first().text().split(':')[1].trim()
    const download = parseSize(downloadString)
    return download
  }

  protected parseBonus(query: JQuery<Document>): number {
    const bonusString = query.find('li:contains("Points:")')
      .first().text().split(':')[1].trim().replaceAll(',', '')
    const bonus = parseInt(bonusString)
    return bonus
  }

  protected async getSeedingInfo(): Promise<SeedingInfo> {
    return { seeding: 0, seedingSize: 0, seedingList: [] }
  }

  async search(keywords: string, expectTorrents: number, pattern?: string): Promise<TorrentInfo[] | ESiteStatus> {
    try {
      if (!pattern)
        pattern = '/torrents.php?grouping=0&searchstr={}'

      const path = pattern.replace('{}', keywords.replaceAll('.', ' '))
      const torrents = await this.parsePagination(path, this.parseTorrentPage, 1, expectTorrents)
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

  protected findTorrentRows = (query: JQuery<Document>): JQuery<HTMLElement> => {
    return query.find('table#torrent_table > tbody > tr:not(:eq(0))')
  }

  protected parseTorrentCatagory = (query: JQuery<HTMLElement>): ETorrentCatagory => {
    return ETorrentCatagory.undefined
  }

  protected parseTorrentId = (query: JQuery<HTMLElement>): string => {
    const idString = query.find('a[href*="torrents.php?id="]').attr('href')
    const idMatch = idString ? idString.match(/torrentid=(\d+)/) : undefined
    const id = idMatch ? idMatch[1] : ''
    return id
  }

  protected parseTorrentPromotion = (query: JQuery<HTMLElement>): TorrentPromotion | undefined => {
    return undefined
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

  protected parseTorrentDetailsUrl = (query: JQuery<HTMLElement>): string => {
    const href = query.find('a[href*="torrents.php?id="]').attr('href')
    return this.url.href + href
  }

  protected parseTorrentDownloadUrl = (query: JQuery<HTMLElement>): string => {
    const href = query.find('a[href*="action=download"]').attr('href')
    return this.url.href + href
  }

  protected parseTorrentSeeding = (query: JQuery<HTMLElement>): boolean | undefined => {
    return undefined
  }

  protected parseTorrentSize = (query: JQuery<HTMLElement>): number => {
    const sizeString = query.find('> td').eq(this.tableIndex.size).text()
    const size = sizeString ? parseSize(sizeString) : 0
    return size
  }

  protected parseTorrentSeeders = (query: JQuery<HTMLElement>): number => {
    const seedersString = query.find('> td').eq(this.tableIndex.seeders).text()
    const seeders = seedersString ? parseInt(seedersString) : -1
    return seeders
  }

  protected parseTorrentLeechers = (query: JQuery<HTMLElement>): number => {
    const leechersString = query.find('> td').eq(this.tableIndex.leechers).text()
    const leechers = leechersString ? parseInt(leechersString) : -1
    return leechers
  }

  protected parseTorrentSnatched = (query: JQuery<HTMLElement>): number => {
    const leechersString = query.find('> td').eq(this.tableIndex.snatched).text()
    const leechers = leechersString ? parseInt(leechersString) : -1
    return leechers
  }
}
