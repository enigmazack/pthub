import type { GGroup, GIndex, GTorrent } from '../model/gazelleApiSite'
import GazelleApiSite from '../model/gazelleApiSite'
import type { SeedingInfo, SeedingTorrentInfo } from '../types'
import { parseSize, unescapeHTML } from '../utils'

class DIC extends GazelleApiSite {
  protected async getBonus(_rIndex: GIndex): Promise<number> {
    const query = await this.getAsQuery('/index.php')
    const bonusString = query.find('a[href="bonus.php"]').text().trim()
    const bonusMatch = bonusString.match(/\(([\d,]+)\)/)
    const bonus = bonusMatch ? parseInt(bonusMatch[1].replaceAll(',', '')) : -1
    return bonus
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
    const rows = query.find('table#bprates_details').last().find('> tbody > tr')
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

  protected parseTorrentTitle(g: GGroup, _t: GTorrent): string {
    return `${g.artist} - ${unescapeHTML(g.groupName)} [${g.groupYear}] [${g.releaseType}]`
  }
}

const dicmusic = new DIC({
  name: 'DIC',
  url: 'https://dicmusic.club/',
})

export default dicmusic
