import { ETorrentCatagory, ETorrentPromotion } from '../enum'
import GazelleSite from '../model/gazelleSite'
import type {
  SeedingInfo, TorrentPromotion,
} from '../types'
import { parseSize, parseTimeAgo } from '../utils'

class BTN extends GazelleSite {
  protected parseUserClass(query: JQuery<Document>): string {
    const userClass = query.find('li:contains("User Class")').text().split(':')[1].trim() || ''
    return userClass
  }

  protected parseBonus(query: JQuery<Document>): number {
    const bonusString = query.find('li:contains("Bonus Points")').find('> a').text().replaceAll(',', '')
    const bonus = parseFloat(bonusString)
    return bonus
  }

  protected parseUpload(query: JQuery<Document>): number {
    const uploadString = query.find('#section2').find('li:contains("Upload")')
      .first().text().split(':')[1].trim()
    const upload = parseSize(uploadString)
    return upload
  }

  protected parseDownload(query: JQuery<Document>): number {
    const downloadString = query.find('#section2').find('li:contains("Downloaded")')
      .first().text().split(':')[1].trim()
    const download = parseSize(downloadString)
    return download
  }

  protected async getSeedingInfo(): Promise<SeedingInfo> {
    const url = new URL(this.url.href)
    url.pathname = '/bonus.php'
    url.searchParams.set('action', 'rate')
    const query = await this.getAsQuery(url.pathname + url.search)
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
        const torrentSizeThis = parseSize(row.find('> td').eq(2).text())
        seedingSize += torrentSizeThis
      }
    }
    const seeding = seedingList.length
    return { seeding, seedingSize, seedingList }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected parseTorrentCatagory = (query: JQuery<HTMLElement>): ETorrentCatagory => {
    return ETorrentCatagory.tv
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected parseTorrentPromotion = (query: JQuery<HTMLElement>): TorrentPromotion | undefined => {
    return { status: ETorrentPromotion.free, isTemporary: false }
  }

  protected parseTorrentTitle = (query: JQuery<HTMLElement>): string => {
    return query.find('div:contains("Release Name") > span').attr('title') || ''
  }

  protected parseTorrentSubTitle = (query: JQuery<HTMLElement>): string | undefined => {
    const titleMatch = query.find('> td').eq(2).text().match(/\[(.*?)\]/)
    const title = titleMatch ? titleMatch[1] : ''
    const yearMatch = query.find('> td').eq(2).text().match(/\[(\d+)\]/)
    const year = yearMatch ? yearMatch[1] : ''
    return `${title} / ${year}`
  }

  protected parseTorrentReleaseDate = (query: JQuery<HTMLElement>): number => {
    const dateMatch = query.find('div:contains(\'Added:\')').text().match(/Added:(.+)ago/)
    const dateString = dateMatch ? dateMatch[1].trim() : ''
    const releaseDate = dateString ? parseTimeAgo(dateString) : 0
    return releaseDate
  }
}

const broadcasthenet = new BTN({
  name: 'BTN',
  url: 'https://broadcasthe.net/',
})

export default broadcasthenet
