import NexusPHPSite from '../model/nexusPHPSite'
import { ETorrentCatagory, ETorrentPromotion } from '../enum'
import type { SeedingInfo, TorrentPromotion } from '../types'
import { cfDecodeEmail, parseSize } from '../utils'

class LHD extends NexusPHPSite {
  protected tableIndex = {
    releaseDate: 4,
    size: 5,
    seeders: 6,
    leechers: 7,
    snatched: 8,
  }

  protected async getSeedingInfo(): Promise<SeedingInfo> {
    const url = new URL(this.url.href)
    url.pathname = '/userdetails.php'
    url.searchParams.set('id', this.userId)
    const r = await this.get(url.pathname + url.search)
    const query = this.parseHTML(r.data)
    const seedingString = this.someSelector(query, [
      'td.rowhead:contains("做种统计")',
    ]).next().text()
    const seedingMatch = seedingString.match(/总做种数.+?(\d+).+?总做种体积.+?(\d+\.?\d* *[ZEPTGMK]?i?B)/)
    const seeding = seedingMatch ? parseInt(seedingMatch[1]) : -1
    const seedingSize = seedingMatch ? parseSize(seedingMatch[2]) : -1
    // lhd has no seeding list info
    return { seeding, seedingSize, seedingList: [] }
  }

  protected parseTorrentId = (query: JQuery<HTMLElement>): string => {
    const idString = query.find('a[href*=".php?id="]').first().attr('href')
    const idMatch = idString ? idString.match(/id=(\d+)/) : undefined
    const id = idMatch ? idMatch[1] : ''
    return id
  }

  protected parseTorrentTitle = (query: JQuery<HTMLElement>): string => {
    const b = query.find('a[href*=".php?id="]').first().find('> b')
    let title = b.contents().filter((index, content) => content.nodeType === 3).text()
    const cfemail = b.find('> span.__cf_email__').attr('data-cfemail')
    if (cfemail)
      title += cfDecodeEmail(cfemail)

    return title
  }

  protected parseTorrentSubTitle = (query: JQuery<HTMLElement>): string | undefined => {
    const titleString = query.find('a[href*=".php?id="]').first().parent().next().text()
    const subTitle = titleString || undefined
    return subTitle
  }

  protected parseTorrentReleaseDate = (query: JQuery<HTMLElement>): number => {
    const columns = query.find('> td')
    let index = this.tableIndex.releaseDate
    if (columns.length === 12)
      index += 1

    const dateString = columns.eq(index).find('span').attr('title')
    const releaseDate = dateString ? Date.parse(dateString) : 0
    return releaseDate
  }

  protected parseTorrentSize = (query: JQuery<HTMLElement>): number => {
    const columns = query.find('> td')
    let index = this.tableIndex.size
    if (columns.length === 12)
      index += 1

    const sizeString = columns.eq(index).text()
    const size = sizeString ? parseSize(sizeString) : 0
    return size
  }

  protected parseTorrentSeeders = (query: JQuery<HTMLElement>): number => {
    const columns = query.find('> td')
    let index = this.tableIndex.seeders
    if (columns.length === 12)
      index += 1

    const seedersString = columns.eq(index).text()
    const seeders = seedersString ? parseInt(seedersString) : -1
    return seeders
  }

  protected parseTorrentLeechers = (query: JQuery<HTMLElement>): number => {
    const columns = query.find('> td')
    let index = this.tableIndex.leechers
    if (columns.length === 12)
      index += 1

    const leechersString = columns.eq(index).text()
    const leechers = leechersString ? parseInt(leechersString) : -1
    return leechers
  }

  protected parseTorrentSnatched = (query: JQuery<HTMLElement>): number => {
    const columns = query.find('> td')
    let index = this.tableIndex.snatched
    if (columns.length === 12)
      index += 1

    const snatchedString = columns.eq(index).text()
    const snatched = snatchedString ? parseInt(snatchedString) : -1
    return snatched
  }

  protected parseTorrentDetailsUrl = (query: JQuery<HTMLElement>): string => {
    const path = query.find('a[href*=".php?id="]').first().attr('href') || ''
    return `${this.url.origin}/${path}`
  }

  protected parseTorrentDownloadUrl = (query: JQuery<HTMLElement>): string => {
    const id = this.parseTorrentId(query)
    const url = new URL(this.url.href)
    url.pathname = '/download.php'
    url.searchParams.set('id', id)
    url.searchParams.set('https', '1')
    const downloadUrl = url.href
    return downloadUrl
  }

  protected parseTorrentPromotion = (query: JQuery<HTMLElement>): TorrentPromotion | undefined => {
    const expireString = query.find('div[style*="color: blue"]:contains("(免费剩余") > span').attr('title')
    const expire = expireString ? Date.parse(expireString) : undefined
    const promotion = expire ? { status: ETorrentPromotion.free, isTemporary: true } : undefined
    return promotion
  }

  protected parseTorrentCatagory = (query: JQuery<HTMLElement>): ETorrentCatagory => {
    const map = new Map()
    map.set('cat_movie', ETorrentCatagory.movies)
    map.set('cat_tv', ETorrentCatagory.tv)
    map.set('cat_music', ETorrentCatagory.music)
    map.set('cat_animate', ETorrentCatagory.animation)
    map.set('cat_mv', ETorrentCatagory.mv)
    map.set('cat_doc', ETorrentCatagory.documentary)
    map.set('cat_other', ETorrentCatagory.other)
    const cKey = query.find('> td').eq(0).find('img').attr('class')
    const catagory = cKey ? map.get(cKey) : undefined
    return catagory || ETorrentCatagory.other
  }
}

const lemonhd = new LHD({
  name: 'LemonHD',
  url: 'https://lemonhd.org/',
})

export default lemonhd
