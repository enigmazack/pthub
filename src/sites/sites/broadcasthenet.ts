import { ESiteStatus, ETorrentCatagory, ETorrentPromotion } from '../enum'
import NexusPHPSite from '../model/nexusPHPSite'
import {
  SeedingInfo, TorrentInfo, TorrentPromotion
} from '../types'

class BTN extends NexusPHPSite {
  protected userPath = '/user.php'
  protected userPathRegex = /user\.php\?id=(\d+)/
  protected tableIndex = {
    releaseDate: 3,
    size: 4,
    seeders: 6,
    leechers: 7,
    snatched: 5
  }

  protected parseUserName (query: JQuery<Document>): string {
    const name = query.find('a[href*="user.php?id="]').first().text()
    return name
  }

  protected parseJoinDate (query: JQuery<Document>): number {
    const joinDateString = query.find('li:contains("Joined")').find('> span').attr('title')
    const joinDate = joinDateString ? Date.parse(joinDateString) : 0
    return joinDate
  }

  protected parseUserClass (query: JQuery<Document>): string {
    const userClass = query.find('li:contains("User Class")').text().split(':')[1].trim() || ''
    return userClass
  }

  protected parseBonus (query: JQuery<Document>): number {
    const bonusString = query.find('li:contains("Bonus Points")').find('> a').text().replaceAll(',', '')
    const bonus = parseFloat(bonusString)
    return bonus
  }

  protected parseUpload (query: JQuery<Document>): number {
    const uploadString = query.find('#section2').find('li:contains("Upload")')
      .first().text().split(':')[1].trim()
    const upload = this.parseSize(uploadString)
    return upload
  }

  protected parseDownload (query: JQuery<Document>): number {
    const downloadString = query.find('#section2').find('li:contains("Downloaded")')
      .first().text().split(':')[1].trim()
    const download = this.parseSize(downloadString)
    return download
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async getSeedingInfo (id: string): Promise<SeedingInfo> {
    const url = new URL(this.url.href)
    url.pathname = '/bonus.php'
    url.searchParams.set('action', 'rate')
    const rSeeding = await this.get(url.pathname + url.search)
    const query = this.parseHTML(rSeeding.data)
    const rows = query.find('table#myTable > tbody > tr')
    let seedingSize = 0
    const seedingList: string[] = []
    for (let i = 0; i < rows.length; i++) {
      const row = rows.eq(i)
      const torrentIdString = row.find('a[href*="torrents.php?id="]').attr('href')
      const torrentIdMatch = torrentIdString ? torrentIdString.match(/torrentid=(\d+)/) : undefined
      const torrentId = torrentIdMatch ? torrentIdMatch[1] : undefined
      if (torrentId) {
        seedingList.push(torrentId)
      }
      const torrentSizeThis = this.parseSize(row.find('> td').eq(2).text())
      seedingSize += torrentSizeThis
    }
    const seeding = seedingList.length
    return { seeding, seedingSize, seedingList }
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
        url.searchParams.set('action', 'basic')
        url.searchParams.set('searchstr', keywords.replace('.', ' '))
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

  protected parseTorrentMaxPage (query: JQuery<Document>): number {
    const pageString = query.find('a[href*="&page="]').eq(-3).attr('href')
    const p = pageString ? new URLSearchParams(pageString) : undefined
    const nPage = p ? p.get('page') : undefined
    const maxPage = nPage ? parseInt(nPage) : 0
    return maxPage
  }

  protected findTorrentRows (query: JQuery<Document>): JQuery<HTMLElement> {
    const table = query.find('table#torrent_table')
    const rows = table.find('> tbody > tr:not(:eq(0))')
    return rows
  }

  protected parseTorrentId (query: JQuery<HTMLElement>): string {
    const idString = query.find('a[href*="torrents.php?id="]').attr('href')
    const idMatch = idString ? idString.match(/torrentid=(\d+)/) : undefined
    const id = idMatch ? idMatch[1] : ''
    return id
  }

  protected parseTorrentCatagory (query: JQuery<HTMLElement>): ETorrentCatagory {
    return query.find('img[title="Episode"]').length ? ETorrentCatagory.tvEpisode : ETorrentCatagory.tvSeason
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected parseTorrentPromotion (query: JQuery<HTMLElement>): TorrentPromotion|undefined {
    return { status: ETorrentPromotion.free, isTemporary: false }
  }

  protected parseTorrentTitle (query: JQuery<HTMLElement>): string {
    return query.find('div:contains("Release Name") > span').attr('title') || ''
  }

  protected parseTorrentSubTitle (query: JQuery<HTMLElement>): string|undefined {
    const titleMatch = query.find('> td').eq(2).text().match(/\[(.*?)\]/)
    const title = titleMatch ? titleMatch[1] : ''
    const yearMatch = query.find('> td').eq(2).text().match(/\[(\d+)\]/)
    const year = yearMatch ? yearMatch[1] : ''
    return title + ' / ' + year
  }

  protected parseTorrentReleaseDate (query: JQuery<HTMLElement>): number {
    const dateMatch = query.find("div:contains('Added:')").text().match(/Added:(.+)ago/)
    const dateString = dateMatch ? dateMatch[1].trim() : ''
    const releaseDate = dateString ? this.parseTimeAgo(dateString) : 0
    return releaseDate
  }

  protected parseTorrentDetailsUrl (query: JQuery<HTMLElement>): string {
    const href = query.find('a[href*="torrents.php?id="]').attr('href')
    return this.url.href + href
  }

  protected parseTorrentDownloadUrl (query: JQuery<HTMLElement>): string {
    const href = query.find('a[href*="action=download"]').attr('href')
    return this.url.href + href
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected parseTorrentSeeding (query: JQuery<HTMLElement>): boolean|undefined {
    return undefined
  }

  protected parseTimeAgo (timeStr: string): number {
    const timeRegex = timeStr.match(
      /((\d+).+?(minute|hour|day|week|month|year)s?.*?(,|and))?.*?(\d+).+?(minute|hour|day|week|month|year)s?/
    )
    let milliseconds = 0
    if (timeRegex) {
      if (timeRegex[1] === undefined) {
        milliseconds = this.getMilliseconds(parseInt(timeRegex[5]), timeRegex[6])
      } else {
        milliseconds = this.getMilliseconds(parseInt(timeRegex[2]), timeRegex[3]) +
          this.getMilliseconds(parseInt(timeRegex[5]), timeRegex[6])
      }
    }
    const timeStamp = Date.now() - milliseconds
    return timeStamp
  }

  protected getMilliseconds (num: number, unit: string): number {
    let milliseconds = 0
    milliseconds = num * 60 * 1000
    if (unit === 'minute') { return milliseconds }
    milliseconds = milliseconds * 60
    if (unit === 'hour') { return milliseconds }
    milliseconds = milliseconds * 24
    if (unit === 'day') { return milliseconds }
    milliseconds = milliseconds * 7
    if (unit === 'week') { return milliseconds }
    milliseconds = milliseconds * 30 / 7
    if (unit === 'month') { return milliseconds }
    milliseconds = milliseconds * 12
    return milliseconds
  }
}

const broadcasthenet = new BTN({
  name: 'BTN',
  url: 'https://broadcasthe.net/'
})

export default broadcasthenet
