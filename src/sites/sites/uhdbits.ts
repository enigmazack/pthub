import { ETorrentCatagory } from '../enum'
import type { GGroup, GIndex, GTorrent } from '../model/gazelleApiSite'
import GazelleApiSite from '../model/gazelleApiSite'
import type { SeedingInfo, SeedingTorrentInfo } from '../types'
import { parseSize } from '../utils'

class UHDBits extends GazelleApiSite {
  protected async getBonus(_rIndex: GIndex): Promise<number> {
    const query = await this.getAsQuery('/index.php')
    const bonusString = query.find('span.stat.tooltip').eq(3).text().trim()
    const bonus = bonusString ? parseInt(bonusString.replaceAll(',', '')) : -1
    return bonus
  }

  protected async getSeedingInfo(): Promise<SeedingInfo> {
    const seedingTorrents = await this.parsePagination(
      `/torrents.php?type=seeding&userid=${this.userId}`, this.parseSeedingInfoPage, 1,
    )
    const seeding = seedingTorrents.length
    let seedingSize = 0
    seedingTorrents.forEach((t) => { seedingSize += t.size })
    const seedingList = seedingTorrents.map(t => t.id)
    return { seeding, seedingSize, seedingList }
  }

  private parseSeedingInfoPage = (query: JQuery<Document>): SeedingTorrentInfo[] => {
    const seedingTorrents: SeedingTorrentInfo[] = []
    const rows = query.find('table.torrent_table').last().find('> tbody > tr')
    for (let i = 1; i < rows.length; i++) {
      const row = rows.eq(i)
      const idString = row.find('> td').eq(1).find('a[href*="torrentid="]').first().attr('href')
      const idMatch = idString ? idString.match(/torrentid=(\d+)/) : undefined
      const id = idMatch ? idMatch[1] : undefined
      const sizeString = row.find('> td').eq(3).text()
      const size = sizeString ? parseSize(sizeString) : 0
      if (id)
        seedingTorrents.push({ id, size })
    }
    return seedingTorrents
  }

  protected parseTorrentCatagory(group: GGroup, _torrent?: GTorrent): ETorrentCatagory {
    const map = new Map()
    map.set('Movie', ETorrentCatagory.movies)
    map.set('TV', ETorrentCatagory.tv)
    const catagory = group.category ? map.get(group.category) : undefined
    return catagory || ETorrentCatagory.other
  }
}

const uhdbits = new UHDBits({
  name: 'UHDBits',
  url: 'https://uhdbits.org/',
})

export default uhdbits
