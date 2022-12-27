import NexusPHPSite from '../model/nexusPHPSite'
import { ETorrentCatagory } from '../enum'
import { parseSize } from '../utils'

class PTer extends NexusPHPSite {
  // protected userTorrentPath = '/getusertorrentlist.php'

  protected parseUserName(query: JQuery<Document>): string {
    const name = query.find('table#info_block').find('a[href*="userdetails.php?id="]').first().text()
    return name
  }

  protected parseBonus(query: JQuery<Document>): number {
    const bonusString = this.someSelector(query, [
      'td.rowhead:contains("猫粮")',
      'td.rowhead:contains("貓糧")',
      'td.rowhead:contains("Karma"):contains("Points")',
    ]).next().text()
    const bonus = parseFloat(bonusString)
    return bonus
  }

  protected parseSeedingInfoSize(query: JQuery<HTMLElement>): number {
    // td 3 not 2 for pterclub
    const torrentSizeString = query.find('td').eq(3).text()
    const torrentSizeThis = torrentSizeString ? parseSize(torrentSizeString) : 0
    return torrentSizeThis
  }

  protected async getSeedingInfoAsQuery(): Promise<JQuery<Document>> {
    const url = new URL(this.url.href)
    url.pathname = '/getusertorrentlist.php'
    url.searchParams.set('do_ajax', '1')
    url.searchParams.set('userid', this.userId)
    url.searchParams.set('type', 'seeding')
    const query = await this.getAsQuery(url.pathname + url.search)
    return query
  }

  protected parseTorrentTitle = (query: JQuery<HTMLElement>): string => {
    return query.find('table.torrentname > tbody > tr > td').eq(1).find('a').eq(0).attr('title') || ''
  }

  protected parseTorrentSubTitle = (query: JQuery<HTMLElement>): string | undefined => {
    return query.find('table.torrentname > tbody > tr > td').eq(1)
      .find('> div > div').eq(1).find('> span').text().trim()
  }

  protected parseTorrentSeeding = (query: JQuery<HTMLElement>): boolean | undefined => {
    return !!query.find('img.progbargreen[style*="98"]').length
  }

  protected parseTorrentCatagory = (query: JQuery<HTMLElement>): ETorrentCatagory => {
    const map = new Map()
    map.set('401', ETorrentCatagory.movies)
    map.set('404', ETorrentCatagory.tv)
    map.set('403', ETorrentCatagory.animation)
    map.set('405', ETorrentCatagory.tv)
    map.set('413', ETorrentCatagory.mv)
    map.set('418', ETorrentCatagory.tv)
    map.set('407', ETorrentCatagory.sports)
    map.set('408', ETorrentCatagory.ebook)
    map.set('409', ETorrentCatagory.games)
    map.set('410', ETorrentCatagory.application)
    map.set('411', ETorrentCatagory.learning)
    map.set('412', ETorrentCatagory.other)
    const cKey = this.parseTorrentCatagoryKey(query)
    const catagory = cKey ? map.get(cKey) : undefined
    return catagory || ETorrentCatagory.other
  }
}

const pterclub = new PTer({
  name: 'PTer',
  url: 'https://pterclub.com/',
})

export default pterclub
