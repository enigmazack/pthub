import NexusPHPSite from './model/nexusPHPSite'

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
}

const pterclub = new PTer({
  name: 'PTer',
  url: 'https://pterclub.com/'
})

export default pterclub
