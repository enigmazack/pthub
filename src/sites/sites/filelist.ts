import CommonSite from '../model/commonSite'
import { ETorrentCatagory, ETorrentPromotion } from '../enum'
import type { SeedingInfo, SeedingTorrentInfo, TorrentPromotion } from '../types'
import { parseSize } from '../utils'

class FileList extends CommonSite {
  protected indexPath = '/index.php'
  protected userIdRegex = /userdetails\.php\?id=(\d+)/
  protected userPath = '/userdetails.php'
  protected defaultSearchPattern = '/browse.php?search={}&searchin=1'
  protected paginationStartIndex: 0 | 1 = 0

  protected parseUserName(query: JQuery<Document>): string {
    return query.find('a[href*="userdetails.php?id="] > span').first().text()
  }

  protected parseJoinDate(query: JQuery<Document>): number {
    const dateString = query.find('td.colhead:contains("Join"):contains("date")').next()
      .text().split('(')[0].trim()
    return Date.parse(dateString)
  }

  protected parseUpload(query: JQuery<Document>): number {
    const uploadString = query.find('td.colhead:contains("Uploaded")').next().text()
    return parseSize(uploadString)
  }

  protected parseDownload(query: JQuery<Document>): number {
    const downloadString = query.find('td.colhead:contains("Downloaded")').next().text()
    return parseSize(downloadString)
  }

  protected parseUserClass(query: JQuery<Document>): string {
    return query.find('td.colhead:contains("Class")').next().text()
  }

  protected parseBonus(query: JQuery<Document>): number {
    const bonusString = query.find('a[href="/shop.php"]').text().replaceAll(',', '')
    return parseFloat(bonusString)
  }

  // Pagination unchecked
  protected async getSeedingInfo(): Promise<SeedingInfo> {
    const seedingTorrents = await this.parsePagination(
      `/snatchlist.php?id=${this.userId}&action=torrents&type=seeding`, this.parseSeedingInfoPage, 1,
    )
    const seeding = seedingTorrents.length
    let seedingSize = 0
    seedingTorrents.forEach((t) => { seedingSize += t.size })
    const seedingList = seedingTorrents.map(t => t.id)
    return { seeding, seedingSize, seedingList }
  }

  private parseSeedingInfoPage = (query: JQuery<Document>): SeedingTorrentInfo[] => {
    const seedingTorrents: SeedingTorrentInfo[] = []
    const rows = query.find('div.cblock-innercontent > table > tbody > tr:not(:eq(0))')
    for (let i = 0; i < rows.length; i++) {
      const row = rows.eq(i)
      const idString = row.find('a[href*="details.php?id="]').attr('href')
      const idMatch = idString ? idString.match(/details.php\?id=(\d+)/) : undefined
      const id = idMatch ? idMatch[1] : undefined
      const sizeString = row.find('> td').eq(5).text()
      const size = sizeString ? parseSize(sizeString) : 0
      if (id)
        seedingTorrents.push({ id, size })
    }
    return seedingTorrents
  }

  protected findTorrentRows = (query: JQuery<Document>): JQuery<HTMLElement> => {
    const rows = query.find('div.torrentrow')
    return rows
  }

  protected parseTorrentCatagoryKey = (query: JQuery<HTMLElement>): string | undefined => {
    const cString = query.find('a[href*="?cat="]').first().attr('href')
    const cMatch = cString ? cString.match(/\?cat=(\d+)/) : undefined
    const cNum = cMatch ? cMatch[1] : undefined
    return cNum
  }

  protected parseTorrentCatagory = (query: JQuery<HTMLElement>): ETorrentCatagory => {
    const map = new Map()
    map.set('24', ETorrentCatagory.animation)
    map.set('11', ETorrentCatagory.music)
    map.set('15', ETorrentCatagory.animation)
    map.set('18', ETorrentCatagory.other)
    map.set('16', ETorrentCatagory.documentary)
    map.set('25', ETorrentCatagory.movies)
    map.set('6', ETorrentCatagory.movies)
    map.set('26', ETorrentCatagory.movies)
    map.set('20', ETorrentCatagory.movies)
    map.set('2', ETorrentCatagory.movies)
    map.set('3', ETorrentCatagory.movies)
    map.set('4', ETorrentCatagory.movies)
    map.set('19', ETorrentCatagory.movies)
    map.set('5', ETorrentCatagory.music)
    map.set('10', ETorrentCatagory.games)
    map.set('9', ETorrentCatagory.games)
    map.set('17', ETorrentCatagory.application)
    map.set('22', ETorrentCatagory.application)
    map.set('8', ETorrentCatagory.application)
    map.set('27', ETorrentCatagory.tv)
    map.set('21', ETorrentCatagory.tv)
    map.set('23', ETorrentCatagory.tv)
    map.set('13', ETorrentCatagory.sports)
    map.set('12', ETorrentCatagory.other)
    map.set('7', ETorrentCatagory.xxx)
    const cKey = this.parseTorrentCatagoryKey(query)
    const catagory = cKey ? map.get(cKey) : undefined
    return catagory || ETorrentCatagory.other
  }

  protected parseTorrentPromotion = (query: JQuery<HTMLElement>): TorrentPromotion | undefined => {
    const isFree = !!query.find('img[alt="FreeLeech"]').length
    return isFree ? { status: ETorrentPromotion.free, isTemporary: false } : undefined
  }

  protected parseTorrentId = (query: JQuery<HTMLElement>): string => {
    const idString = query.find('a[href*="details.php?id="]').first().attr('href')
    const idMatch = idString ? idString.match(/details.php\?id=(\d+)/) : undefined
    const id = idMatch ? idMatch[1] : ''
    return id
  }

  protected parseTorrentTitle = (query: JQuery<HTMLElement>): string => {
    return query.find('a[href*="details.php?id="]').first().text()
  }

  protected parseTorrentSubTitle = (query: JQuery<HTMLElement>): string | undefined => {
    return query.find('a[href*="details.php?id="]').first().parent().find('> font.small').text()
  }

  protected parseTorrentReleaseDate = (query: JQuery<HTMLElement>): number => {
    const dateString = query.find('> div').eq(5).find('font').html()
    let date = dateString.split('<br>')[1]
    date = date.split('/').reverse().join('/')
    const time = dateString.split('<br>')[0]
    return Date.parse(`${date} ${time}`)
  }

  protected parseTorrentSize = (query: JQuery<HTMLElement>): number => {
    const sizeString = query.find('> div').eq(6).text()
    return parseSize(sizeString)
  }

  protected parseTorrentSeeders = (query: JQuery<HTMLElement>): number => {
    const seedersString = query.find('> div').eq(8).text()
    return parseInt(seedersString)
  }

  protected parseTorrentLeechers = (query: JQuery<HTMLElement>): number => {
    const leechersString = query.find('> div').eq(9).text()
    return parseInt(leechersString)
  }

  protected parseTorrentSnatched = (query: JQuery<HTMLElement>): number => {
    const snatchedString = query.find('> div').eq(7).find('font').html().split('<br>')[0]
      .replaceAll(',', '')
    return parseInt(snatchedString)
  }

  protected parseTorrentDetailsUrl = (query: JQuery<HTMLElement>): string => {
    const id = this.parseTorrentId(query)
    const url = new URL(this.url.href)
    url.pathname = '/details.php'
    url.searchParams.set('id', id)
    return url.href
  }

  protected parseTorrentDownloadUrl = (query: JQuery<HTMLElement>): string => {
    const id = this.parseTorrentId(query)
    const url = new URL(this.url.href)
    url.pathname = '/download.php'
    url.searchParams.set('id', id)
    return url.href
  }
}

const filelist = new FileList({
  name: 'FileList',
  url: 'https://filelist.io/',
})

export default filelist
