import { ETorrentCatagory, ETorrentPromotion } from './model/enum'
import NexusPHPSite from './model/nexusPHPSite'
import { SeedingInfo, TorrentPromotion } from './model/site'

class LHD extends NexusPHPSite {
  protected async getSeedingInfo (id: string): Promise<SeedingInfo> {
    const url = new URL(this.url.href)
    url.pathname = this.userPath
    url.searchParams.set('id', id)
    const r = await this.get(url.pathname + url.search)
    const query = this.parseHTML(r.data)
    const seedingString = this.someSelector(query, [
      'td.rowhead:contains("做种统计")'
    ]).next().text()
    const seedingMatch = seedingString.match(/总做种数.+?(\d+).+?总做种体积.+?(\d+\.?\d* *[ZEPTGMK]?i?B)/)
    const seeding = seedingMatch ? parseInt(seedingMatch[1]) : -1
    const seedingSize = seedingMatch ? this.parseSize(seedingMatch[2]) : -1
    // lhd has no seeding list info
    return { seeding, seedingSize }
  }

  protected parseTorrentId (query: JQuery<HTMLElement>): string {
    const idString = query.find('a[href*=".php?id="]').first().attr('href')
    const idMatch = idString ? idString.match(/id=(\d+)/) : undefined
    const id = idMatch ? idMatch[1] : ''
    return id
  }

  protected parseTorrentTitle (query: JQuery<HTMLElement>): string {
    return query.find('a[href*=".php?id="]').first().text().trim() || ''
  }

  protected parseTorrentSubTitle (query: JQuery<HTMLElement>): string|undefined {
    const titleString = query.find('a[href*=".php?id="]').first().parent().next().text()
    const subTitle = titleString || undefined
    return subTitle
  }

  protected parseTorrentReleaseDate (query: JQuery<HTMLElement>): number {
    const dateString = query.find('> td').eq(4).find('span').attr('title')
    const releaseDate = dateString ? Date.parse(dateString) : 0
    return releaseDate
  }

  protected parseTorrentSize (query: JQuery<HTMLElement>): number {
    const sizeString = query.find('> td').eq(5).text()
    const size = sizeString ? this.parseSize(sizeString) : 0
    return size
  }

  protected parseTorrentSeeders (query: JQuery<HTMLElement>): number {
    const seedersString = query.find('> td').eq(6).text()
    const seeders = seedersString ? parseInt(seedersString) : -1
    return seeders
  }

  protected parseTorrentLeechers (query: JQuery<HTMLElement>): number {
    const leechersString = query.find('> td').eq(7).text()
    const leechers = leechersString ? parseInt(leechersString) : -1
    return leechers
  }

  protected parseTorrentDetailsUrl (query: JQuery<HTMLElement>): string {
    const path = query.find('a[href*=".php?id="]').first().attr('href') || ''
    return this.url.origin + '/' + path
  }

  protected parseTorrentDownloadUrl (query: JQuery<HTMLElement>): string {
    const id = this.parseTorrentId(query)
    const url = new URL(this.url.href)
    url.pathname = this.torrentDownloadPath
    url.searchParams.set('id', id)
    url.searchParams.set('https', '1')
    const downloadUrl = url.href
    return downloadUrl
  }

  protected parseTorrentPromotion (query: JQuery<HTMLElement>): TorrentPromotion|undefined {
    const expireString = query.find('div[style*="color: blue"]:contains("(免费剩余") > span').attr('title')
    const expire = expireString ? Date.parse(expireString) : undefined
    const promotion = expire ? this.genTorrentPromotion(ETorrentPromotion.free, expire) : undefined
    return promotion
  }

  protected parseTorrentCatagory (query: JQuery<HTMLElement>): ETorrentCatagory {
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
  url: 'https://lemonhd.org/'
})

export default lemonhd
