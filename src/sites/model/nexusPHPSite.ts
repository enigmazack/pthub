/* eslint-disable @typescript-eslint/no-unused-vars */
import { ESiteStatus, ETorrentCatagory, ETorrentPromotion } from '../enum'
import type { SeedingInfo, TorrentInfo, TorrentPromotion, UserInfo } from '../types'
import { parseSize } from '../utils'
import Site from './site'

export default class NexusPHPSite extends Site {
  protected userId = ''
  protected tableIndex = {
    releaseDate: 3,
    size: 4,
    seeders: 5,
    leechers: 6,
    snatched: 7,
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
      const idMatch = r.data.match(/userdetails\.php\?id=(\d+)/)
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
      url.pathname = '/userdetails.php'
      url.searchParams.set('id', this.userId)
      const r = await this.get(url.pathname + url.search)
      const query = this.parseHTML(r.data)
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
    const name = query.find('a[href*="userdetails.php?id="]').first().text()
    return name
  }

  protected parseJoinDate(query: JQuery<Document>): number {
    const joinDateString = this.someSelector(query, [
      'td.rowhead:contains("加入日期")',
      'td.rowhead:contains("Join"):contains("date")',
    ]).next().find('span').attr('title')
    const joinDate = joinDateString ? Date.parse(joinDateString) : 0
    return joinDate
  }

  protected parseUpload(query: JQuery<Document>): number {
    const transfersString = this.someSelector(query, [
      'td.rowhead:contains("传输")',
      'td.rowhead:contains("傳送")',
      'td.rowhead:contains("Transfers")',
    ]).next().text()
    const uploadMatch = transfersString.match(/(上[传傳]量|Uploaded).+?(\d+\.?\d* *[ZEPTGMK]?i?B)/)
    const uploadString = uploadMatch ? uploadMatch[2] : ''
    const upload = parseSize(uploadString)
    return upload
  }

  protected parseDownload(query: JQuery<Document>): number {
    const transfersString = this.someSelector(query, [
      'td.rowhead:contains("传输")',
      'td.rowhead:contains("傳送")',
      'td.rowhead:contains("Transfers")',
    ]).next().text()
    const downloadMatch = transfersString.match(/(下[载載]量|Downloaded).+?(\d+\.?\d* *[ZEPTGMK]?i?B)/)
    const downloadString = downloadMatch ? downloadMatch[2] : ''
    const download = parseSize(downloadString)
    return download
  }

  protected parseUserClass(query: JQuery<Document>): string {
    const userClass = this.someSelector(query, [
      'td.rowhead:contains("等级")',
      'td.rowhead:contains("等級")',
      'td.rowhead:contains("Class")',
    ]).next().find('img').attr('title') || ''
    return userClass
  }

  protected parseBonus(query: JQuery<Document>): number {
    const bonusString = this.someSelector(query, [
      'td.rowhead:contains("魔力值")',
      'td.rowhead:contains("Karma"):contains("Points")',
    ]).next().text()
    const bonus = parseFloat(bonusString)
    return bonus
  }

  protected async getSeedingInfoAsQuery(): Promise<JQuery<Document>> {
    const query = await this.getAsQuery(`/getusertorrentlistajax.php?type=seeding&userid=${this.userId}`)
    return query
  }

  protected parseSeedingInfoSize(query: JQuery<HTMLElement>): number {
    const torrentSizeString = query.find('td').eq(2).text()
    const torrentSizeThis = torrentSizeString ? parseSize(torrentSizeString) : 0
    return torrentSizeThis
  }

  protected async getSeedingInfo(): Promise<SeedingInfo> {
    const query = await this.getSeedingInfoAsQuery()
    const rows = query.find('tr')
    let seedingSize = 0
    const seedingList: string[] = []
    for (let i = 1; i < rows.length; i++) {
      const row = rows.eq(i)
      const torrentIdString = row.find('a[href*="details.php?id="]').attr('href')
      const torrentIdMatch = torrentIdString ? torrentIdString.match(/details.php\?id=(\d+)/) : undefined
      const torrentId = torrentIdMatch ? torrentIdMatch[1] : undefined
      if (torrentId) {
        seedingList.push(torrentId)
        const torrentSizeThis = this.parseSeedingInfoSize(row)
        seedingSize += torrentSizeThis
      }
    }
    const seeding = seedingList.length
    return { seeding, seedingSize, seedingList }
  }

  async search(keywords: string, expectTorrents: number, pattern?: string): Promise<TorrentInfo[] | ESiteStatus> {
    try {
      if (!pattern)
        pattern = '/torrents.php?search={}'

      const path = pattern.replace('{}', keywords.replaceAll('.', ' '))
      const torrents = await this.parsePagination(path, this.parseTorrentPage, 0, expectTorrents)
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
    const cString = query.find('a[href*="?cat="]').first().attr('href')
    const cMatch = cString ? cString.match(/\?cat=(\d+)/) : undefined
    const cNum = cMatch ? cMatch[1] : undefined
    return cNum
  }

  protected parseTorrentCatagory = (query: JQuery<HTMLElement>): ETorrentCatagory => {
    return ETorrentCatagory.undefined
  }

  protected parseTorrentSeeding = (query: JQuery<HTMLElement>): boolean | undefined => {
    const seedingString = query.find('td.peer-active').text()
    const seeding = seedingString ? seedingString.trim() === '100%' : false
    return seeding
  }

  protected parseTorrentPromotion = (query: JQuery<HTMLElement>): TorrentPromotion | undefined => {
    const map = new Map()
    map.set('pro_free', ETorrentPromotion.free)
    map.set('pro_2up', ETorrentPromotion.double)
    map.set('pro_free2up', ETorrentPromotion.doubleFree)
    map.set('pro_50pctdown', ETorrentPromotion.half)
    map.set('pro_50pctdown2up', ETorrentPromotion.doubleHalf)
    map.set('pro_30pctdown', ETorrentPromotion.thirtyPercent)
    const promotionString = this.someSelector(query, [
      'img.pro_free',
      'img.pro_2up',
      'img.pro_free2up',
      'img.pro_50pctdown',
      'img.pro_50pctdown2up',
      'img.pro_30pctdown',
    ]).attr('class')
    const status = map.get(promotionString)
    const promotion = status ? { status, isTemporary: false } : undefined
    return promotion
  }

  protected parseTorrentId = (query: JQuery<HTMLElement>): string => {
    const idString = query.find('a[href*="details.php?id="]').attr('href')
    const idMatch = idString ? idString.match(/id=(\d+)/) : undefined
    const id = idMatch ? idMatch[1] : ''
    return id
  }

  protected parseTorrentTitle = (query: JQuery<HTMLElement>): string => {
    return query.find('a[href*="details.php?id="]').attr('title') || ''
  }

  protected parseTorrentSubTitle = (query: JQuery<HTMLElement>): string | undefined => {
    const titleString = query.find('a[href*="details.php?id="]').first().parent().html()
    const subTitle = titleString ? titleString.split('>').pop() : undefined
    return subTitle
  }

  protected parseTorrentReleaseDate = (query: JQuery<HTMLElement>): number => {
    const dateString = query.find('> td').eq(this.tableIndex.releaseDate).find('span').attr('title')
    const releaseDate = dateString ? Date.parse(dateString) : 0
    return releaseDate
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

  protected parseTorrentDetailsUrl = (query: JQuery<HTMLElement>): string => {
    const id = this.parseTorrentId(query)
    const url = new URL(this.url.href)
    url.pathname = '/details.php'
    url.searchParams.set('id', id)
    url.searchParams.set('hit', '1')
    const detailUrl = url.href
    return detailUrl
  }

  protected parseTorrentDownloadUrl = (query: JQuery<HTMLElement>): string => {
    const id = this.parseTorrentId(query)
    const url = new URL(this.url.href)
    url.pathname = '/download.php'
    url.searchParams.set('id', id)
    const downloadUrl = url.href
    return downloadUrl
  }

  protected findTorrentRows = (query: JQuery<Document>): JQuery<HTMLElement> => {
    const table = query.find('table.torrents').last()
    const rows = table.find('> tbody > tr:not(:eq(0))')
    return rows
  }
}
