import GazelleApiSite from '../model/gazelleApiSite'
import { SeedingInfo } from '../types'

class Redacted extends GazelleApiSite {
  protected async getSeedingInfo (id: string): Promise<SeedingInfo> {
    const url = new URL(this.url.href)
    url.pathname = '/torrents.php'
    url.searchParams.set('userid', id)
    url.searchParams.set('type', 'seeding')
    const r = await this.get(url.pathname + url.search)
    const query = this.parseHTML(r.data)
    let seeding = 0
    let seedingSize = 0
    let seedingList: string[] = []
    let currentPage = this.parseSeedingInfoPage(query)
    seeding += currentPage.seeding
    seedingSize += currentPage.seedingSize
    if (currentPage.seedingList) {
      seedingList = seedingList.concat(currentPage.seedingList)
    }
    const pageString = query.find('a[href*="page"]').last().attr('href')
    const pageMatch = pageString ? pageString.match(/page=(\d+)/) : undefined
    const maxPage = pageMatch ? parseInt(pageMatch[1]) : 0
    if (maxPage) {
      for (let i = 2; i <= maxPage; i++) {
        url.searchParams.set('page', i.toString())
        const rPage = await this.get(url.pathname + url.search)
        const qPage = this.parseHTML(rPage.data)
        currentPage = this.parseSeedingInfoPage(qPage)
        seeding += currentPage.seeding
        seedingSize += currentPage.seedingSize
        if (currentPage.seedingList) {
          seedingList = seedingList.concat(currentPage.seedingList)
        }
      }
    }
    return { seeding, seedingSize, seedingList }
  }

  private parseSeedingInfoPage (query: JQuery<Document>): SeedingInfo {
    let seedingSize = 0
    const seedingList: string[] = []
    const rows = query.find('table.torrent_table > tbody > tr:not(:eq(0))')
    for (let i = 0; i < rows.length; i++) {
      const row = rows.eq(i)
      const torrentIdString = row.find('a[href*="torrents.php?id="]').attr('href')
      const torrentIdMatch = torrentIdString ? torrentIdString.match(/torrentid=(\d+)/) : undefined
      const torrentId = torrentIdMatch ? torrentIdMatch[1] : undefined
      if (torrentId) {
        seedingList.push(torrentId)
      }
      const sizeString = row.find('> td').eq(3).text()
      const size = sizeString ? this.parseSize(sizeString) : 0
      seedingSize += size
    }
    const seeding = seedingList.length
    return { seeding, seedingSize, seedingList }
  }
}

const redacted = new Redacted({
  name: 'Redacted',
  url: 'https://redacted.ch/'
})

export default redacted
