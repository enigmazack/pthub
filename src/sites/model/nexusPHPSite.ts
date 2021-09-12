import Site from './site'
import {
  ETorrentCatagory,
  ETorrentPromotion,
  ESiteStatus
} from '../enum'
import {
  UserInfo,
  SeedingInfo,
  SearchConfig,
  TorrentInfo,
  TorrentPromotion
} from '../types'

export default class NexusPHPSite extends Site {
  protected userId = ''
  protected indexPath = '/index.php'
  protected userPath = '/userdetails.php'
  protected userTorrentPath = '/getusertorrentlistajax.php'
  protected torrentPath = '/torrents.php'
  protected torrentDetailsPath = '/details.php'
  protected torrentDownloadPath = '/download.php'

  async checkStatus (): Promise<ESiteStatus> {
    try {
      let isLogin = false
      const r = await this.get(this.indexPath)
      if (r.request && r.request.responseURL) {
        isLogin = r.request.responseURL.match(/index\.php/)
      }
      return isLogin ? ESiteStatus.login : ESiteStatus.logout
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        return ESiteStatus.timeout
      }
      return ESiteStatus.error
    }
  }

  async getUserId (): Promise<string|ESiteStatus> {
    if (this.userId) {
      return this.userId
    }
    try {
      const r = await this.get(this.indexPath)
      const idMatch = r.data.match(/userdetails\.php\?id=(\d+)/)
      const id = idMatch ? idMatch[1] : ''
      this.userId = id
      return id
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        return ESiteStatus.timeout
      }
      console.log(error)
      return ''
    }
  }

  async getUserInfo (): Promise<UserInfo|ESiteStatus> {
    const id = await this.getUserId()
    if (!id) {
      return ESiteStatus.getUserIdfailed
    }
    if (id === ESiteStatus.timeout) {
      return ESiteStatus.timeout
    }
    try {
      const url = new URL(this.url.href)
      url.pathname = this.userPath
      url.searchParams.set('id', id)
      const r = await this.get(url.pathname + url.search)
      const query = this.parseHTML(r.data)
      // user name
      const name = this.parseUserName(query)
      // join date
      const joinDate = this.parseJoinDate(query)
      // upload download ratio
      const upload = this.parseUpload(query)
      const download = this.parseDownload(query)
      const ratio = upload / download
      // user class
      const userClass = this.parseUserClass(query)
      // bonus
      const bonus = this.parseBonus(query)
      // seeding size list
      const seedingInfo = await this.getSeedingInfo(id)
      return {
        name,
        id,
        joinDate,
        upload,
        download,
        ratio,
        bonus,
        userClass,
        ...seedingInfo
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        return ESiteStatus.timeout
      }
      console.log(error)
      return ESiteStatus.getUserDatafailed
    }
  }

  protected parseUserName (query: JQuery<Document>): string {
    const name = query.find('a[href*="userdetails.php?id="]').first().text()
    return name
  }

  protected parseJoinDate (query: JQuery<Document>): number|undefined {
    const joinDateString = this.someSelector(query, [
      'td.rowhead:contains("加入日期")',
      'td.rowhead:contains("Join"):contains("date")'
    ]).next().find('span').attr('title')
    const joinDate = joinDateString ? Date.parse(joinDateString) : undefined
    return joinDate
  }

  protected parseUpload (query: JQuery<Document>): number {
    const transfersString = this.someSelector(query, [
      'td.rowhead:contains("传输")',
      'td.rowhead:contains("傳送")',
      'td.rowhead:contains("Transfers")'
    ]).next().text()
    const uploadMatch = transfersString.match(/(上[传傳]量|Uploaded).+?(\d+\.?\d* *[ZEPTGMK]?i?B)/)
    const uploadString = uploadMatch ? uploadMatch[2] : ''
    const upload = this.parseSize(uploadString)
    return upload
  }

  protected parseDownload (query: JQuery<Document>): number {
    const transfersString = this.someSelector(query, [
      'td.rowhead:contains("传输")',
      'td.rowhead:contains("傳送")',
      'td.rowhead:contains("Transfers")'
    ]).next().text()
    const downloadMatch = transfersString.match(/(下[载載]量|Downloaded).+?(\d+\.?\d* *[ZEPTGMK]?i?B)/)
    const downloadString = downloadMatch ? downloadMatch[2] : ''
    const download = this.parseSize(downloadString)
    return download
  }

  protected parseUserClass (query: JQuery<Document>): string {
    const userClass = this.someSelector(query, [
      'td.rowhead:contains("等级")',
      'td.rowhead:contains("等級")',
      'td.rowhead:contains("Class")'
    ]).next().find('img').attr('title') || ''
    return userClass
  }

  protected parseBonus (query: JQuery<Document>): number {
    const bonusString = this.someSelector(query, [
      'td.rowhead:contains("魔力值")',
      'td.rowhead:contains("Karma"):contains("Points")'
    ]).next().text()
    const bonus = parseFloat(bonusString)
    return bonus
  }

  protected async getSeedingInfoQuery (id: string): Promise<JQuery<Document>> {
    const url = new URL(this.url.href)
    url.pathname = this.userTorrentPath
    url.searchParams.set('userid', id)
    url.searchParams.set('type', 'seeding')
    const rSeeding = await this.get(url.pathname + url.search)
    const query = this.parseHTML(rSeeding.data)
    return query
  }

  // parse size of a seeding torrent
  protected parseSeedingInfoSize (query: JQuery<HTMLElement>): number {
    const torrentSizeString = query.find('td').eq(2).text()
    const torrentSizeThis = torrentSizeString ? this.parseSize(torrentSizeString) : 0
    return torrentSizeThis
  }

  // parse seeding torrent counts
  protected parseSeedingInfoSeeding (query: JQuery<Document>): number {
    const seedingString = query.find('body > b').first().text()
    const seeding = seedingString ? parseInt(seedingString) : 0
    return seeding
  }

  // get user seeding torrent info
  protected async getSeedingInfo (id: string): Promise<SeedingInfo> {
    const query = await this.getSeedingInfoQuery(id)
    const seeding = this.parseSeedingInfoSeeding(query)
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
      }
      const torrentSizeThis = this.parseSeedingInfoSize(row)
      seedingSize += torrentSizeThis
    }
    return { seeding, seedingSize, seedingList }
  }

  protected parseTorrentCatagoryKey (query: JQuery<HTMLElement>): string|undefined {
    const cString = query.find('a[href*="?cat="]').first().attr('href')
    const cMatch = cString ? cString.match(/\?cat=(\d+)/) : undefined
    const cNum = cMatch ? cMatch[1] : undefined
    return cNum
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected parseTorrentCatagory (query: JQuery<HTMLElement>): ETorrentCatagory|undefined {
    return undefined
  }

  protected parseTorrentSeeding (query: JQuery<HTMLElement>): boolean {
    const seedingString = query.find('td.peer-active').text()
    const seeding = seedingString ? seedingString.trim() === '100%' : false
    return seeding
  }

  protected parseTorrentPromotion (query: JQuery<HTMLElement>): TorrentPromotion|undefined {
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
      'img.pro_30pctdown'
    ]).attr('class')
    const status = map.get(promotionString)
    const promotion = status ? this.genTorrentPromotion(status) : undefined
    return promotion
  }

  protected parseTorrentId (query: JQuery<HTMLElement>): string {
    const idString = query.find('a[href*="details.php?id="]').attr('href')
    const idMatch = idString ? idString.match(/id=(\d+)/) : undefined
    const id = idMatch ? idMatch[1] : ''
    return id
  }

  protected parseTorrentTitle (query: JQuery<HTMLElement>): string {
    return query.find('a[href*="details.php?id="]').attr('title') || ''
  }

  protected parseTorrentSubTitle (query: JQuery<HTMLElement>): string|undefined {
    const titleString = query.find('a[href*="details.php?id="]').first().parent().html()
    const subTitle = titleString ? titleString.split('>').pop() : undefined
    return subTitle
  }

  protected parseTorrentReleaseDate (query: JQuery<HTMLElement>): number {
    const dateString = query.find('> td').eq(3).find('span').attr('title')
    const releaseDate = dateString ? Date.parse(dateString) : 0
    return releaseDate
  }

  protected parseTorrentSize (query: JQuery<HTMLElement>): number {
    const sizeString = query.find('> td').eq(4).text()
    const size = sizeString ? this.parseSize(sizeString) : 0
    return size
  }

  protected parseTorrentSeeders (query: JQuery<HTMLElement>): number {
    const seedersString = query.find('> td').eq(5).text()
    const seeders = seedersString ? parseInt(seedersString) : -1
    return seeders
  }

  protected parseTorrentLeechers (query: JQuery<HTMLElement>): number {
    const leechersString = query.find('> td').eq(6).text()
    const leechers = leechersString ? parseInt(leechersString) : -1
    return leechers
  }

  protected parseTorrentDetailsUrl (query: JQuery<HTMLElement>): string {
    const id = this.parseTorrentId(query)
    const url = new URL(this.url.href)
    url.pathname = this.torrentDetailsPath
    url.searchParams.set('id', id)
    url.searchParams.set('hit', '1')
    const detailUrl = url.href
    return detailUrl
  }

  protected parseTorrentDownloadUrl (query: JQuery<HTMLElement>): string {
    const id = this.parseTorrentId(query)
    const url = new URL(this.url.href)
    url.pathname = this.torrentDownloadPath
    url.searchParams.set('id', id)
    const downloadUrl = url.href
    return downloadUrl
  }

  protected parseTorrentMaxPage (query: JQuery<Document>): number {
    const pageString = query.find('a[href*="&page="]').eq(-2).attr('href')
    const p = pageString ? new URLSearchParams(pageString) : undefined
    const nPage = p ? p.get('page') : undefined
    const maxPage = nPage ? parseInt(nPage) : 0
    return maxPage
  }

  protected findTorrentRows (query: JQuery<Document>): JQuery<HTMLElement> {
    const table = query.find('table.torrents').last()
    const rows = table.find('> tbody > tr:not(:eq(0))')
    return rows
  }

  protected async getTorrentPageQuery (path: string): Promise<JQuery<Document>> {
    const r = await this.get(path)
    const query = this.parseHTML(r.data)
    return query
  }

  protected parseTorrentPage (query: JQuery<Document>): TorrentInfo[] {
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
        releaseDate,
        catagory,
        seeding,
        promotion
      }
      torrents.push(data)
    }
    return torrents
  }

  async search (keywords: string, config: SearchConfig): Promise<TorrentInfo[]> {
    const url = new URL(this.url.href)
    url.pathname = config.path ? config.path : this.torrentPath
    if (config.params) {
      for (const [key, value] of Object.entries(config.params)) {
        url.searchParams.set(key, value)
      }
    }
    url.searchParams.set('search', keywords)
    const query = await this.getTorrentPageQuery(url.pathname + url.search)
    const maxPage = this.parseTorrentMaxPage(query)
    const maxWanted = config.maxWanted || 100
    let currentPage = 0
    let torrents = this.parseTorrentPage(query)
    while (currentPage < maxPage && torrents.length < maxWanted) {
      currentPage += 1
      url.searchParams.set('page', currentPage.toString())
      const query = await this.getTorrentPageQuery(url.pathname + url.search)
      const moreTorrents = this.parseTorrentPage(query)
      torrents = torrents.concat(moreTorrents)
    }
    return torrents
  }
}
