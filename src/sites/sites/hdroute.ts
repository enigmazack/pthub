import CommonSite from '../model/commonSite'
import { ETorrentCatagory, ETorrentPromotion } from '../enum'
import type { SeedingInfo, SeedingTorrentInfo, TorrentPromotion } from '../types'
import { parseSize } from '../utils'

class HDRoute extends CommonSite {
  protected indexPath = '/index.php'
  protected userPath = '/userdetail.php'
  protected userIdRegex = /userdetail\.php\?id=(\d+)/
  protected defaultSearchPattern = '/browse.php?s={}&dp=0&add=0&action=s&or=1'
  protected paginationStartIndex: 0 | 1 = 1

  protected parseUserName(query: JQuery<Document>): string {
    const name = query.find('a[href*="userdetail.php?id="]').first().text()
    return name
  }

  protected parseJoinDate(query: JQuery<Document>): number {
    const joinDateString = this.someSelector(query, [
      'div.userdetail-list-title:contains("注册日期")',
      'div.userdetail-list-title:contains("Reg.Date")',
    ]).next().text()
    const joinDate = joinDateString ? Date.parse(joinDateString) : 0
    return joinDate
  }

  protected parseUpload(query: JQuery<Document>): number {
    const transfersString = this.someSelector(query, [
      'div.userdetail-list-title:contains("总上传量")',
      'div.userdetail-list-title:contains("Uploaded")',
    ]).next().text()
    const uploadMatch = transfersString.match(/(\d+) (字节|Bytes)/)
    const uploadString = uploadMatch ? uploadMatch[1] : ''
    const upload = parseInt(uploadString)
    return upload
  }

  protected parseDownload(query: JQuery<Document>): number {
    const transfersString = this.someSelector(query, [
      'div.userdetail-list-title:contains("总下载量")',
      'div.userdetail-list-title:contains("Downloaded")',
    ]).next().text()
    const downloadMatch = transfersString.match(/(\d+) (字节|Bytes)/)
    const downloadString = downloadMatch ? downloadMatch[1] : ''
    const download = parseInt(downloadString)
    return download
  }

  protected parseUserClass(query: JQuery<Document>): string {
    const userClass = this.someSelector(query, [
      'div.userdetail-list-title:contains("用户等级")',
      'div.userdetail-list-title:contains("Class")',
    ]).next().text().split(' ')[0]
    return userClass
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected parseBonus(query: JQuery<Document>): number {
    return -1
  }

  protected async getSeedingInfo(): Promise<SeedingInfo> {
    const seedingTorrents = await this.parsePagination(
      `/list_seeding.php?id=${this.userId}`, this.parseSeedingInfoPage, 1,
    )
    const seeding = seedingTorrents.length
    let seedingSize = 0
    seedingTorrents.forEach((t) => { seedingSize += t.size })
    const seedingList = seedingTorrents.map(t => t.id)
    return { seeding, seedingSize, seedingList }
  }

  private parseSeedingInfoPage = (query: JQuery<Document>): SeedingTorrentInfo[] => {
    const seedingTorrents: SeedingTorrentInfo[] = []
    const rows = query.find('dt.torrent-content')
    for (let i = 0; i < rows.length; i++) {
      const row = rows.eq(i)
      const idString = row.attr('id')
      const idMatch = idString ? idString.match(/dt_torrent_(\d+)/) : undefined
      const id = idMatch ? idMatch[1] : undefined
      const sizeString = row.find('div.torrent_size').text()
      const size = sizeString ? parseSize(sizeString) : 0
      if (id)
        seedingTorrents.push({ id, size })
    }
    return seedingTorrents
  }

  protected findTorrentRows = (query: JQuery<Document>): JQuery<HTMLElement> => {
    const rows = query.find('dl[id*="dl_torrent_"]')
    return rows
  }

  protected parseTorrentPromotion = (query: JQuery<HTMLElement>): TorrentPromotion | undefined => {
    const map = new Map()
    map.set('sprite_dlp000', ETorrentPromotion.free)
    map.set('sprite_dlp050', ETorrentPromotion.half)
    map.set('sprite_dlp030', ETorrentPromotion.thirtyPercent)
    const promotionString = this.someSelector(query, [
      'figure.sprite_dlp000',
      'figure.sprite_dlp050',
      'figure.sprite_dlp030',
    ]).attr('class')
    const status = map.get(promotionString)
    const isTemporary = !!query.find('figure.sprite_tempo_free').length
    const promotion = status ? { status, isTemporary } : undefined
    return promotion
  }

  protected parseTorrentId = (query: JQuery<HTMLElement>): string => {
    const idString = query.attr('id')
    const idMatch = idString ? idString.match(/dl_torrent_(\d+)/) : undefined
    const id = idMatch ? idMatch[1] : ''
    return id
  }

  protected parseTorrentDetailsUrl = (query: JQuery<HTMLElement>): string => {
    const id = this.parseTorrentId(query)
    const url = new URL(this.url.href)
    url.pathname = '/details.php'
    url.searchParams.set('id', id)
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

  protected parseTorrentTitle = (query: JQuery<HTMLElement>): string => {
    return query.find('p.title_eng').text() || ''
  }

  protected parseTorrentSubTitle = (query: JQuery<HTMLElement>): string | undefined => {
    return query.find('p.title_chs').text() || ''
  }

  protected parseTorrentReleaseDate = (query: JQuery<HTMLElement>): number => {
    const dateString = query.find('div.torrent_added').html().replace('<br>', ' ')
    const releaseDate = dateString ? Date.parse(dateString) : 0
    return releaseDate
  }

  protected parseTorrentSize = (query: JQuery<HTMLElement>): number => {
    const sizeString = query.find('div.torrent_size').text()
    const size = sizeString ? parseSize(sizeString) : 0
    return size
  }

  protected parseTorrentSeeders = (query: JQuery<HTMLElement>): number => {
    const seedersString = query.find('div.torrent_count').eq(1).text()
    const seeders = seedersString ? parseInt(seedersString) : -1
    return seeders
  }

  protected parseTorrentLeechers = (query: JQuery<HTMLElement>): number => {
    const leechersString = query.find('div.torrent_count').eq(2).text()
    const leechers = leechersString ? parseInt(leechersString) : -1
    return leechers
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected parseTorrentCatagory = (query: JQuery<HTMLElement>): ETorrentCatagory => {
    return ETorrentCatagory.movies
  }
}

const hdroute = new HDRoute({
  name: 'HDRoute',
  url: 'http://hdroute.org/',
})

export default hdroute
