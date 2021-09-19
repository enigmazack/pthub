import { ESiteStatus, ETorrentPromotion } from '../enum'
import Site from '../model/nexusPHPSite'
import {
  SeedingInfo, TorrentInfo, TorrentPromotion
} from '../types'

class HDRoute extends Site {
  protected userPath = '/userdetail.php'
  protected userPathRegex = /userdetail\.php\?id=(\d+)/
  protected userTorrentPath = '/list_seeding.php'
  protected torrentPath = '/browse.php'

  protected parseUserName (query: JQuery<Document>): string {
    const name = query.find('a[href*="userdetail.php?id="]').first().text()
    return name
  }

  protected parseJoinDate (query: JQuery<Document>): number|undefined {
    const joinDateString = this.someSelector(query, [
      'div.userdetail-list-title:contains("注册日期")',
      'div.userdetail-list-title:contains("Reg.Date")'
    ]).next().text()
    const joinDate = joinDateString ? Date.parse(joinDateString) : undefined
    return joinDate
  }

  protected parseUpload (query: JQuery<Document>): number {
    const transfersString = this.someSelector(query, [
      'div.userdetail-list-title:contains("总上传量")',
      'div.userdetail-list-title:contains("Uploaded")'
    ]).next().text()
    const uploadMatch = transfersString.match(/(\d+) (字节|Bytes)/)
    const uploadString = uploadMatch ? uploadMatch[1] : ''
    const upload = parseInt(uploadString)
    return upload
  }

  protected parseDownload (query: JQuery<Document>): number {
    const transfersString = this.someSelector(query, [
      'div.userdetail-list-title:contains("总下载量")',
      'div.userdetail-list-title:contains("Downloaded")'
    ]).next().text()
    const downloadMatch = transfersString.match(/(\d+) (字节|Bytes)/)
    const downloadString = downloadMatch ? downloadMatch[1] : ''
    const download = parseInt(downloadString)
    return download
  }

  protected parseUserClass (query: JQuery<Document>): string {
    const userClass = this.someSelector(query, [
      'div.userdetail-list-title:contains("用户等级")',
      'div.userdetail-list-title:contains("Class")'
    ]).next().text().split(' ')[0]
    return userClass
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected parseBonus (query: JQuery<Document>): number {
    return NaN
  }

  protected async getSeedingInfo (id: string): Promise<SeedingInfo> {
    const url = new URL(this.url.href)
    url.pathname = this.userTorrentPath
    url.searchParams.set('id', id)
    const rSeeding = await this.get(url.pathname + url.search)
    const query = this.parseHTML(rSeeding.data)
    let seeding = 0
    let seedingSize = 0
    let seedingList: string[] = []
    let currentPage = this.parseSeedingInfoPage(query)
    seeding += currentPage.seeding
    seedingSize += currentPage.seedingSize
    if (currentPage.seedingList) {
      seedingList = seedingList.concat(currentPage.seedingList)
    }
    // if more pages
    const pageString = query.find('a[href*="list_seeding.php?id="]:contains("1")').last().attr('href')
    const pageMatch = pageString ? pageString.match(/page=(\d+)/) : undefined
    const maxPage = pageMatch ? parseInt(pageMatch[1]) : 0
    if (maxPage) {
      for (let i = 2; i <= maxPage; i++) {
        url.searchParams.set('page', i.toString())
        const rPage = await this.get(url.pathname + url.search)
        const qPage = this.parseHTML(rPage.data)
        currentPage = this.parseSeedingInfoPage(qPage)
        seeding += currentPage.seeding
        seedingSize += currentPage.seedingSize
        if (currentPage.seedingList) {
          seedingList = seedingList.concat(currentPage.seedingList)
        }
      }
    }
    return { seeding, seedingSize, seedingList }
  }

  private parseSeedingInfoPage (query: JQuery<Document>): SeedingInfo {
    let seeding = 0
    let seedingSize = 0
    const seedingList: string[] = []
    const rows = query.find('dt.torrent-content')
    seeding = rows.length
    for (let i = 0; i < seeding; i++) {
      const row = rows.eq(i)
      const torrentIdString = row.attr('id')
      const torrentIdMatch = torrentIdString ? torrentIdString.match(/dt_torrent_(\d+)/) : undefined
      const torrentId = torrentIdMatch ? torrentIdMatch[1] : undefined
      if (torrentId) {
        seedingList.push(torrentId)
      }
      const sizeString = row.find('div.torrent_size').text()
      const size = sizeString ? this.parseSize(sizeString) : 0
      seedingSize += size
    }
    return { seeding, seedingSize, seedingList }
  }

  protected findTorrentRows (query: JQuery<Document>): JQuery<HTMLElement> {
    const rows = query.find('dl[id*="dl_torrent_"]')
    return rows
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected parseTorrentSeeding (query: JQuery<HTMLElement>) {
    return undefined
  }

  protected parseTorrentPromotion (query: JQuery<HTMLElement>): TorrentPromotion|undefined {
    const map = new Map()
    map.set('sprite_dlp000', ETorrentPromotion.free)
    map.set('sprite_dlp050', ETorrentPromotion.half)
    map.set('sprite_dlp030', ETorrentPromotion.thirtyPercent)
    const promotionString = this.someSelector(query, [
      'figure.sprite_dlp000',
      'figure.sprite_dlp050',
      'figure.sprite_dlp030'
    ]).attr('class')
    const status = map.get(promotionString)
    const isTemporary = !!query.find('figure.sprite_tempo_free').length
    const promotion = status ? { status, isTemporary } : undefined
    return promotion
  }

  protected parseTorrentId (query: JQuery<HTMLElement>): string {
    const idString = query.attr('id')
    const idMatch = idString ? idString.match(/dl_torrent_(\d+)/) : undefined
    const id = idMatch ? idMatch[1] : ''
    return id
  }

  protected parseTorrentTitle (query: JQuery<HTMLElement>): string {
    return query.find('p.title_eng').text() || ''
  }

  protected parseTorrentSubTitle (query: JQuery<HTMLElement>): string|undefined {
    return query.find('p.title_chs').text() || ''
  }

  protected parseTorrentReleaseDate (query: JQuery<HTMLElement>): number {
    const dateString = query.find('div.torrent_added').html().replace('<br>', ' ')
    const releaseDate = dateString ? Date.parse(dateString) : 0
    return releaseDate
  }

  protected parseTorrentSize (query: JQuery<HTMLElement>): number {
    const sizeString = query.find('div.torrent_size').text()
    const size = sizeString ? this.parseSize(sizeString) : 0
    return size
  }

  protected parseTorrentSeeders (query: JQuery<HTMLElement>): number {
    const seedersString = query.find('div.torrent_count').eq(1).text()
    const seeders = seedersString ? parseInt(seedersString) : NaN
    return seeders
  }

  protected parseTorrentLeechers (query: JQuery<HTMLElement>): number {
    const leechersString = query.find('div.torrent_count').eq(2).text()
    const leechers = leechersString ? parseInt(leechersString) : NaN
    return leechers
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected parseTorrentSnatched (query: JQuery<HTMLElement>): number {
    return NaN
  }

  async search (keywords: string, expectTorrents: number, pattern?: string): Promise<TorrentInfo[]|ESiteStatus> {
    try {
      const url = new URL(this.url.href)
      if (pattern) {
        const [pathname, search] = pattern.split('?')
        url.pathname = pathname
        url.search = search.replace('{}', keywords.replace('.', ' '))
      } else {
        url.pathname = this.torrentPath
        url.searchParams.set('s', keywords.replace('.', ' '))
      }
      const query = await this.getTorrentPageQuery(url.pathname + url.search)
      const maxPage = this.parseTorrentMaxPage(query)
      let currentPage = 1
      let torrents = this.parseTorrentPage(query)
      while (currentPage < maxPage && torrents.length < expectTorrents) {
        currentPage += 1
        url.searchParams.set('page', currentPage.toString())
        const query = await this.getTorrentPageQuery(url.pathname + url.search)
        const moreTorrents = this.parseTorrentPage(query)
        torrents = torrents.concat(moreTorrents)
      }
      return torrents
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        return ESiteStatus.timeout
      }
      return ESiteStatus.searchFailed
    }
  }
}

const hdroute = new HDRoute({
  name: 'HDRoute',
  url: 'http://hdroute.org/'
})

export default hdroute
