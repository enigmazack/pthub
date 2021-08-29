/* eslint-disable @typescript-eslint/no-explicit-any */
import Site, {
  userInfo,
  SeedingInfo,
  searchConfig,
  torrentInfo
} from './site'

export default class NexusPHPSite extends Site {
  protected indexPath = '/index.php'
  protected userPath = '/userdetails.php'
  protected userTorrentPath = '/getusertorrentlistajax.php'
  protected torrentPath = '/torrents.php'
  protected torrentDetailsPath = '/details.php'
  protected torrentDownloadPath = '/download.php'
  async checkConnection (): Promise<string> {
    try {
      let isLogin = false
      const r = await this.get(this.indexPath, false)
      if (r.request && r.request.responseURL) {
        isLogin = r.request.responseURL.match(/index\.php/)
      }
      return isLogin ? 'connected_with_login' : 'connected_without_login'
    } catch {
      return 'no_connection'
    }
  }

  async getUserId (): Promise<string> {
    try {
      const r = await this.get(this.indexPath)
      const id = r.data.match(/userdetails\.php\?id=(\d+)/)[1]
      return id
    } catch {
      return 'unknow'
    }
  }

  protected parseUserName (query: JQuery<any>): string {
    const name = query.find('a[href*="userdetails.php?id="]').first().text()
    return name
  }

  protected parseJoinDate (query: JQuery<any>): number|undefined {
    const joinDateString = this.someSelector(query, [
      'td.rowhead:contains("加入日期")',
      'td.rowhead:contains("Join"):contains("date")'
    ]).next().find('span').attr('title')
    const joinDate = joinDateString ? Date.parse(joinDateString) : undefined
    return joinDate
  }

  protected parseUpload (query: JQuery<any>): number {
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

  protected parseDownload (query: JQuery<any>): number {
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

  protected parseUserClass (query: JQuery<any>): string {
    const userClass = this.someSelector(query, [
      'td.rowhead:contains("等级")',
      'td.rowhead:contains("等級")',
      'td.rowhead:contains("Class")'
    ]).next().find('img').attr('title') || ''
    return userClass
  }

  protected parseBonus (query: JQuery<any>): number {
    const bonusString = this.someSelector(query, [
      'td.rowhead:contains("魔力值")',
      'td.rowhead:contains("Karma"):contains("Points")'
    ]).next().text()
    const bonus = parseFloat(bonusString)
    return bonus
  }

  protected async getSeedingInfoQuery (id: string): Promise<JQuery<any>> {
    const url = new URL(this.url.href)
    url.pathname = this.userTorrentPath
    url.searchParams.set('userid', id)
    url.searchParams.set('type', 'seeding')
    const rSeeding = await this.get(url.pathname + url.search)
    const query = this.parseHTML(rSeeding.data)
    return query
  }

  protected async getSeedingInfo (id: string): Promise<SeedingInfo> {
    const query = await this.getSeedingInfoQuery(id)
    const seedingString = this.someSelector(query, ['b', 'p']).first().text()
    const seeding = parseInt(seedingString)
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
      const torrentSizeString = row.find('td').eq(2).text()
      const torrentSizeThis = torrentSizeString ? this.parseSize(torrentSizeString) : 0
      seedingSize += torrentSizeThis
    }
    return { seeding, seedingSize, seedingList }
  }

  async getUserInfo (): Promise<userInfo|string> {
    try {
      const id = await this.getUserId()
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
    } catch (err) {
      console.log(err)
      return 'failed'
    }
  }

  // parse torrent catagory left blank
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected parseTorrentCatagory (query: JQuery<any>): string {
    return ''
  }

  protected parseTorrentId (query: JQuery<any>): string {
    const idString = query.find('a[href*="details.php?id="]').attr('href')
    const idMatch = idString ? idString.match(/id=(\d+)/) : undefined
    const id = idMatch ? idMatch[1] : ''
    return id
  }

  protected parseTorrentTitle (query: JQuery<any>): string {
    return query.find('a[href*="details.php?id="]').attr('title') || ''
  }

  protected parseTorrentSubTitle (query: JQuery<any>): string {
    const titleString = query.find('a[href*="details.php?id="]').parent().html()
    const subTitle = titleString.split('<br>')[1] || ''
    return subTitle
  }

  protected parseTorrentReleaseDate (query: JQuery<any>): number {
    const dateString = query.find('> td').eq(3).find('span').attr('title')
    const releaseDate = dateString ? Date.parse(dateString) : 0
    return releaseDate
  }

  protected parseTorrentSize (query: JQuery<any>): number {
    const sizeString = query.find('> td').eq(4).text()
    const size = sizeString ? this.parseSize(sizeString) : 0
    return size
  }

  protected parseTorrentSeeders (query: JQuery<any>): number {
    const seedersString = query.find('> td').eq(5).text()
    const seeders = seedersString ? parseInt(seedersString) : -1
    return seeders
  }

  protected parseTorrentLeechers (query: JQuery<any>): number {
    const leechersString = query.find('> td').eq(6).text()
    const leechers = leechersString ? parseInt(leechersString) : -1
    return leechers
  }

  async search (keywords: string, config: searchConfig): Promise<torrentInfo[]> {
    const url = new URL(this.url.href)
    url.pathname = config.path ? config.path : this.torrentPath
    for (const p of config.params) {
      url.searchParams.set(p.key, p.value)
    }
    url.searchParams.set('search', keywords)
    const torrents: torrentInfo[] = []
    const r = await this.get(url.pathname + url.search)
    const query = this.parseHTML(r.data)
    const table = this.someSelector(query, [
      'table.torrents'
    ]).last()
    const rows = table.find('> tbody > tr')
    for (let i = 1; i < rows.length; i++) {
      const row = rows.eq(i)
      // catagory
      const catagory = this.parseTorrentCatagory(row)
      // id
      const id = this.parseTorrentId(row)
      // detail url
      let url = new URL(this.url.href)
      url.pathname = this.torrentDetailsPath
      url.searchParams.set('id', id)
      url.searchParams.set('hit', '1')
      const detailUrl = url.href
      // download url
      url = new URL(this.url.href)
      url.pathname = this.torrentDownloadPath
      url.searchParams.set('id', id)
      const downloadUrl = url.href
      const title = this.parseTorrentTitle(row)
      const subTitle = this.parseTorrentSubTitle(row)
      const releaseDate = this.parseTorrentReleaseDate(row)
      const size = this.parseTorrentSize(row)
      const seeders = this.parseTorrentSeeders(row)
      const leechers = this.parseTorrentLeechers(row)
      torrents.push({
        id,
        title,
        subTitle,
        detailUrl,
        downloadUrl,
        size,
        seeders,
        leechers,
        releaseDate,
        catagory
      })
    }
    return torrents
  }
}
