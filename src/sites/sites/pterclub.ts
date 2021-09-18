import NexusPHPSite from '../model/nexusPHPSite'
import { ETorrentCatagory } from '../enum'

class PTer extends NexusPHPSite {
  protected userTorrentPath = '/getusertorrentlist.php'

  protected parseUserName (query: JQuery<Document>): string {
    const name = query.find('table#info_block').find('a[href*="userdetails.php?id="]').first().text()
    return name
  }

  protected parseBonus (query: JQuery<Document>): number {
    const bonusString = this.someSelector(query, [
      'td.rowhead:contains("猫粮")',
      'td.rowhead:contains("貓糧")',
      'td.rowhead:contains("Karma"):contains("Points")'
    ]).next().text()
    const bonus = parseFloat(bonusString)
    return bonus
  }

  protected parseSeedingInfoSize (query: JQuery<HTMLElement>): number {
    // td 3 not 2 for pterclub
    const torrentSizeString = query.find('td').eq(3).text()
    const torrentSizeThis = torrentSizeString ? this.parseSize(torrentSizeString) : 0
    return torrentSizeThis
  }

  protected async getSeedingInfoQuery (id: string): Promise<JQuery<Document>> {
    const url = new URL(this.url.href)
    url.pathname = this.userTorrentPath
    url.searchParams.set('do_ajax', '1')
    url.searchParams.set('userid', id)
    url.searchParams.set('type', 'seeding')
    const rSeeding = await this.get(url.pathname + url.search)
    const query = this.parseHTML(rSeeding.data)
    return query
  }

  protected parseTorrentCatagory (query: JQuery<HTMLElement>): ETorrentCatagory {
    const map = new Map()
    map.set('401', ETorrentCatagory.movies)
    map.set('404', ETorrentCatagory.tv)
    map.set('403', ETorrentCatagory.animation)
    map.set('405', ETorrentCatagory.tvShow)
    map.set('413', ETorrentCatagory.mv)
    map.set('418', ETorrentCatagory.tvShow)
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
  url: 'https://pterclub.com/'
})

export default pterclub
