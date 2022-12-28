import axios from 'axios'
import { ESiteStatus, ETorrentCatagory, ETorrentPromotion } from '../enum'
import type { SeedingInfo, SeedingTorrentInfo, TorrentInfo, TorrentPromotion, UserInfo } from '../types'
import { parseSize, parseTimeAgo } from '../utils'
import Site from './site'

export default class Unit3D extends Site {
  protected userName = ''
  protected tableIndex = {
    size: 5,
    seeders: 6,
    leechers: 7,
    snatched: 8,
    releaseDate: 4,
  }

  async checkStatus(): Promise<ESiteStatus> {
    try {
      let isLogin = false
      const r = await this.get('/')
      if (r.request && r.request.responseURL)
        isLogin = true

      return isLogin ? ESiteStatus.login : ESiteStatus.logout
    }
    catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 401)
        return ESiteStatus.logout

      if (error instanceof Error && error.message.includes('timeout'))
        return ESiteStatus.timeout

      return ESiteStatus.error
    }
  }

  protected async getUserName(): Promise<void> {
    if (!this.userName) {
      const query = await this.getAsQuery('')
      const nameString = query.find('a[href*="/users"]').first().attr('href')
      const nameMatch = nameString ? nameString.match(/users\/(.+)/) : undefined
      const id = nameMatch ? nameMatch[1] : ''
      this.userName = id
    }
  }

  async getUserInfo(): Promise<UserInfo | ESiteStatus> {
    try {
      await this.getUserName()
      if (!this.name)
        return ESiteStatus.getUserIdFailed

      const query = await this.getAsQuery(`/users/${this.userName}`)
      const id = this.someSelector(query, [
        'td:contains("User ID")',
        'td:contains("用户ID")',
      ]).next().text()
      const name = this.userName
      const joinDateString = this.someSelector(query, [
        'h4:contains("Registration date")',
        'h4:contains("注册日期")',
        'h4:contains("註冊日期")',
      ]).text().replace(/(Registration date|注册日期|註冊日期)/g, '').trim()
      const joinDate = Date.parse(joinDateString)
      const uploadString = this.someSelector(query, [
        'td:contains("Recorded Upload")',
        'td:contains("虚拟上传量")',
      ]).next().find('span').eq(0).text()
      const upload = parseSize(uploadString)
      const downloadString = this.someSelector(query, [
        'td:contains("Recorded Download")',
        'td:contains("虚拟下载量")',
      ]).next().find('span').eq(0).text()
      const download = parseSize(downloadString)
      const userClass = this.someSelector(query, [
        'h4:contains("Group")',
        'h4:contains("组别")',
        'h4:contains("組別")',
      ]).find('span').text().trim()
      const bonusString = this.someSelector(query, [
        'td:contains("BON")',
        'td:contains("魔力")',
      ]).next().find('span > span').eq(0).text()
      const bonus = parseFloat(bonusString)
      const seedingInfo = await this.getSeedingInfo()
      return {
        name,
        id,
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

      return ESiteStatus.getUserDataFailed
    }
  }

  // Pagination unchecked
  protected async getSeedingInfo(): Promise<SeedingInfo> {
    const seedingTorrents = await this.parsePagination(
      `/users/${this.userName}/seeds`, this.parseSeedingInfoPage, 1,
    )
    const seeding = seedingTorrents.length
    let seedingSize = 0
    seedingTorrents.forEach((t) => { seedingSize += t.size })
    const seedingList = seedingTorrents.map(t => t.id)
    return { seeding, seedingSize, seedingList }
  }

  private parseSeedingInfoPage = (query: JQuery<Document>): SeedingTorrentInfo[] => {
    const seedingTorrents: SeedingTorrentInfo[] = []
    const rows = query.find('table.table > tbody > tr')
    for (let i = 0; i < rows.length; i++) {
      const row = rows.eq(i)
      const idString = row.find('a[href*="/torrents/"]').first().attr('href')
      const idMatch = idString ? idString.match(/torrents\/(\d+)/) : undefined
      const id = idMatch ? idMatch[1] : undefined
      const sizeString = row.find('> td').eq(1).text().trim()
      const size = parseSize(sizeString)
      if (id)
        seedingTorrents.push({ id, size })
    }
    return seedingTorrents
  }

  async search(keywords: string, expectTorrents: number, pattern?: string): Promise<TorrentInfo[] | ESiteStatus> {
    try {
      if (!pattern)
        pattern = '/torrents/filter?search={}'

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
    const rows = query.find('table.table').first().find('> tbody > tr')
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

  protected parseTorrentCatagory = (_query: JQuery<HTMLElement>): ETorrentCatagory => {
    return ETorrentCatagory.undefined
  }

  protected parseTorrentCatagoryKey = (query: JQuery<HTMLElement>): string | undefined => {
    const catagoryString = query.find('a[href*="/categories/"]').first().attr('href')
    const catagoryMatch = catagoryString ? catagoryString.match(/categories\/(\d+)/) : undefined
    const catagoryKey = catagoryMatch ? catagoryMatch[1] : undefined
    return catagoryKey
  }

  protected parseTorrentSeeding = (query: JQuery<HTMLElement>): boolean | undefined => {
    return !!query.find('i.fas.fa-arrow-up').length
  }

  protected parseTorrentPromotion = (query: JQuery<HTMLElement>): TorrentPromotion | undefined => {
    let status: ETorrentPromotion | undefined
    if (query.find('i.fas.fa-star.text-gold').length)
      status = ETorrentPromotion.free

    return status ? { status, isTemporary: false } : undefined
  }

  protected parseTorrentId = (query: JQuery<HTMLElement>): string => {
    const idString = query.find('a[href*="/torrents/"]').first().attr('href')
    const idMatch = idString ? idString.match(/torrents\/(\d+)/) : undefined
    const id = idMatch ? idMatch[1] : ''
    return id
  }

  protected parseTorrentTitle = (query: JQuery<HTMLElement>): string => {
    return query.find('a[href*="/torrents/"]').first().text().trim()
  }

  protected parseTorrentSubTitle = (_query: JQuery<HTMLElement>): string | undefined => {
    return undefined
  }

  protected parseTorrentReleaseDate = (query: JQuery<HTMLElement>): number => {
    let dateString = query.find('> td').eq(this.tableIndex.releaseDate).text().trim()
    dateString = dateString.replace('秒前', ' seconds ago')
      .replace('分钟前', ' minutes ago')
      .replace('分鐘前', ' minutes ago')
      .replace('小時前', ' hours ago')
      .replace('小时前', ' hours ago')
      .replace('天前', ' days ago')
      .replace('週前', ' weeks ago')
      .replace('周前', ' weeks ago')
      .replace('個月前', ' months ago')
      .replace('个月前', ' months ago')
      .replace('年前', ' years ago')
    return parseTimeAgo(dateString)
  }

  protected parseTorrentSize = (query: JQuery<HTMLElement>): number => {
    const sizeString = query.find('> td').eq(this.tableIndex.size).text().trim()
    return parseSize(sizeString)
  }

  protected parseTorrentSeeders = (query: JQuery<HTMLElement>): number => {
    const seedersString = query.find('> td').eq(this.tableIndex.seeders).text().trim()
    return parseInt(seedersString)
  }

  protected parseTorrentLeechers = (query: JQuery<HTMLElement>): number => {
    const leechersString = query.find('> td').eq(this.tableIndex.leechers).text().trim()
    return parseInt(leechersString)
  }

  protected parseTorrentSnatched = (query: JQuery<HTMLElement>): number => {
    const snatchedString = query.find('> td').eq(this.tableIndex.snatched).text().trim()
    return parseInt(snatchedString)
  }

  protected parseTorrentDetailsUrl = (query: JQuery<HTMLElement>): string => {
    return query.find('a[href*="/torrents/"]').first().attr('href') || ''
  }

  protected parseTorrentDownloadUrl = (query: JQuery<HTMLElement>): string => {
    return query.find('a[href*="/download/"]').first().attr('href') || ''
  }
}
