/* eslint-disable @typescript-eslint/no-explicit-any */
import NexusPHPSite from './model/nexusPHPSite'
import { SiteCatagory } from './model/site'

class PTer extends NexusPHPSite {
  protected userTorrentPath = '/getusertorrentlist.php'

  protected parseUserName (query: JQuery<any>): string {
    const name = query.find('table#info_block').find('a[href*="userdetails.php?id="]').first().text()
    return name
  }

  protected parseBonus (query: JQuery<any>): number {
    const bonusString = this.someSelector(query, [
      'td.rowhead:contains("猫粮")',
      'td.rowhead:contains("貓糧")',
      'td.rowhead:contains("Karma"):contains("Points")'
    ]).next().text()
    const bonus = parseFloat(bonusString)
    return bonus
  }

  protected parseSeedingInfoSize (query: JQuery<any>): number {
    // td 3 not 2 for pterclub
    const torrentSizeString = query.find('td').eq(3).text()
    const torrentSizeThis = torrentSizeString ? this.parseSize(torrentSizeString) : 0
    return torrentSizeThis
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async getSeedingInfoQuery (id: string): Promise<JQuery<any>> {
    const url = new URL(this.url.href)
    url.pathname = this.userTorrentPath
    url.searchParams.set('do_ajax', '1')
    url.searchParams.set('userid', id)
    url.searchParams.set('type', 'seeding')
    const rSeeding = await this.get(url.pathname + url.search)
    const query = this.parseHTML(rSeeding.data)
    return query
  }
}

const pterclub = new PTer({
  name: 'pterclub',
  url: 'https://pterclub.com/',
  abbreviation: 'PTer',
  catagory: SiteCatagory.general,
  tags: [
    SiteCatagory.movies,
    SiteCatagory.tv,
    SiteCatagory.animation
  ]
})

export default pterclub
