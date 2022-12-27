import type { GIndex } from '../model/gazelleApiSite'
import GazelleApiSite from '../model/gazelleApiSite'
import type { SeedingInfo, SeedingTorrentInfo } from '../types'
import { parseSize } from '../utils'

class Orpheus extends GazelleApiSite {
  protected async getBonus(rIndex: GIndex): Promise<number> {
    return rIndex.userstats.bonusPoints || -1
  }

  protected async getSeedingInfo(): Promise<SeedingInfo> {
    const seedingTorrents = await this.parsePagination(
      '/bonus.php?action=bprates', this.parseSeedingInfoPage, 1,
    )
    const seeding = seedingTorrents.length
    let seedingSize = 0
    seedingTorrents.forEach((t) => { seedingSize += t.size })
    const seedingList = seedingTorrents.map(t => t.id)
    return { seeding, seedingSize, seedingList }
  }

  private parseSeedingInfoPage = (query: JQuery<Document>): SeedingTorrentInfo[] => {
    const seedingTorrents: SeedingTorrentInfo[] = []
    const rows = query.find('div#content > table').last().find('> tbody > tr')
    for (let i = 0; i < rows.length; i++) {
      const row = rows.eq(i)
      const idString = row.find('a[href*="torrents.php?id="]').attr('href')
      const idMatch = idString ? idString.match(/torrentid=(\d+)/) : undefined
      const id = idMatch ? idMatch[1] : undefined
      const sizeString = row.find('> td').eq(1).text()
      const size = sizeString ? parseSize(sizeString) : 0
      if (id)
        seedingTorrents.push({ id, size })
    }
    return seedingTorrents
  }
}

const orpheus = new Orpheus({
  name: 'Orpheus',
  url: 'https://orpheus.network/',
})

export default orpheus
