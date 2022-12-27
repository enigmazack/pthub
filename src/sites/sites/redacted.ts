import GazelleApiSite from '../model/gazelleApiSite'
import type { SeedingInfo, SeedingTorrentInfo } from '../types'
import { parseSize } from '../utils'

class Redacted extends GazelleApiSite {
  protected async getSeedingInfo(): Promise<SeedingInfo> {
    const seedingTorrents = await this.parsePagination(
      `/torrents.php?userid=${this.userId}&type=seeding`, this.parseSeedingInfoPage, 1,
    )
    const seeding = seedingTorrents.length
    let seedingSize = 0
    seedingTorrents.forEach((t) => { seedingSize += t.size })
    const seedingList = seedingTorrents.map(t => t.id)
    return { seeding, seedingSize, seedingList }
  }

  private parseSeedingInfoPage = (query: JQuery<Document>): SeedingTorrentInfo[] => {
    const seedingTorrents: SeedingTorrentInfo[] = []
    const rows = query.find('table.torrent_table > tbody > tr:not(:eq(0))')
    for (let i = 0; i < rows.length; i++) {
      const row = rows.eq(i)
      const idString = row.find('a[href*="torrents.php?id="]').attr('href')
      const idMatch = idString ? idString.match(/torrentid=(\d+)/) : undefined
      const id = idMatch ? idMatch[1] : undefined
      const sizeString = row.find('> td').eq(3).text()
      const size = sizeString ? parseSize(sizeString) : 0
      if (id)
        seedingTorrents.push({ id, size })
    }
    return seedingTorrents
  }
}

const redacted = new Redacted({
  name: 'Redacted',
  url: 'https://redacted.ch/',
})

export default redacted
