/* eslint-disable @typescript-eslint/no-explicit-any */
import NexusPHPSite from './model/nexusPHPSite'
import { SeedingInfo } from './model/site'

class MT extends NexusPHPSite {
  protected async getSeedingInfo (id: string): Promise<SeedingInfo> {
    const rSeeding = await this.get(`/getusertorrentlist.php?userid=${id}&type=seeding`)
    const query = this.parseHTML(rSeeding.data)
    let seeding = 0
    let seedingSize = 0
    let seedingList: string[] = []
    let currentPage = this.parseSeedingInfoPage(query)
    seeding += currentPage.seeding
    seedingSize += currentPage.seedingSize
    seedingList = seedingList.concat(currentPage.seedingList)
    // if more pages
    const pageString = query.find('a[href*="type=seeding"]:contains("1")').last().attr('href')
    const pageMatch = pageString ? pageString.match(/page=(\d+)/) : undefined
    const maxPage = pageMatch ? parseInt(pageMatch[1]) : 0
    if (maxPage) {
      for (let i = 1; i <= maxPage; i++) {
        const rPage = await this.get(`/getusertorrentlist.php?userid=${id}&type=seeding&page=${i}`)
        const qPage = this.parseHTML(rPage.data)
        currentPage = this.parseSeedingInfoPage(qPage)
        seeding += currentPage.seeding
        seedingSize += currentPage.seedingSize
        seedingList = seedingList.concat(currentPage.seedingList)
      }
    }
    return { seeding, seedingSize, seedingList }
  }

  private parseSeedingInfoPage (query: JQuery<any>): SeedingInfo {
    let seeding = 0
    let seedingSize = 0
    const seedingList: string[] = []
    const rows = query.find('a[href*="details.php?id="]:not(:eq(0))')
    seeding = rows.length
    for (let i = 0; i < seeding; i++) {
      const row = rows.eq(i)
      const torrentIdString = row.attr('href')
      const torrentIdMatch = torrentIdString ? torrentIdString.match(/id=(\d+)/) : undefined
      const torrentId = torrentIdMatch ? torrentIdMatch[1] : undefined
      if (torrentId) {
        seedingList.push(torrentId)
      }
      const sizeString = row.parent().next().text()
      const size = sizeString ? this.parseSize(sizeString) : 0
      seedingSize += size
    }
    return { seeding, seedingSize, seedingList }
  }
}
const mteam = new MT({
  name: 'kp.m-team.cc',
  url: 'https://kp.m-team.cc/',
  abbreviation: 'MT'
})

export default mteam
