import { parseInt } from 'lodash'
import GazelleApiSite from '../model/gazelleApiSite'
import { SeedingInfo } from '../types'
import { parseSize } from '../utils'

class Orpheus extends GazelleApiSite {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async getBonusAndSeedingInfo (id: string): Promise<{bonus: number, seedingInfo: SeedingInfo}> {
    const url = new URL(this.url.href)
    url.pathname = '/bonus.php'
    url.searchParams.set('action', 'bprates')
    const r = await this.get(url.pathname + url.search)
    const query = this.parseHTML(r.data)
    const bonusString = query.find('div#content > div.header > h3').text().split(':')[1].trim().replaceAll(',', '')
    const bonus = bonusString ? parseInt(bonusString) : -1
    let seeding = 0
    let seedingSize = 0
    let seedingList: string[] = []
    let currentPage = this.parseSeedingInfoPage(query)
    seeding += currentPage.seeding
    seedingSize += currentPage.seedingSize
    if (currentPage.seedingList) {
      seedingList = seedingList.concat(currentPage.seedingList)
    }
    const pageString = query.find('div#content > div.linkbox > a[href*="page="]').last().attr('href')
    const pageMatch = pageString ? pageString.match(/page=(\d+)/) : undefined
    const maxPage = pageMatch ? parseInt(pageMatch[1]) : 1
    if (maxPage > 1) {
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
    return { seedingInfo: { seeding, seedingSize, seedingList }, bonus }
  }

  private parseSeedingInfoPage (query: JQuery<Document>): SeedingInfo {
    let seedingSize = 0
    const seedingList: string[] = []
    const rows = query.find('div#content > table').last().find('> tbody > tr')
    for (let i = 0; i < rows.length; i++) {
      const row = rows.eq(i)
      const torrentIdString = row.find('a[href*="torrents.php?id="]').attr('href')
      const torrentIdMatch = torrentIdString ? torrentIdString.match(/torrentid=(\d+)/) : undefined
      const torrentId = torrentIdMatch ? torrentIdMatch[1] : undefined
      if (torrentId) {
        seedingList.push(torrentId)
      }
      const sizeString = row.find('> td').eq(1).text()
      const size = sizeString ? parseSize(sizeString) : 0
      seedingSize += size
    }
    const seeding = seedingList.length
    return { seeding, seedingSize, seedingList }
  }
}

const orpheus = new Orpheus({
  name: 'Redacted',
  url: 'https://orpheus.network/'
})

export default orpheus
