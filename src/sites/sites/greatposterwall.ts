import { ETorrentCatagory } from '../enum'
import GazelleApiSite, { GIndex, GGroup, GTorrent } from '../model/gazelleApiSite'
import { SeedingInfo, SeedingTorrentInfo } from '../types'
import { parseSize, unescapeHTML } from '../utils'

class GPW extends GazelleApiSite {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async getBonus (rIndex: GIndex): Promise<number> {
    const query = await this.getAsQuery('/index.php')
    const bonusString = query.find('a[href="bonus.php"]').text().trim()
    const bonusMatch = bonusString.match(/\(([\d,]+)\)/)
    const bonus = bonusMatch ? parseInt(bonusMatch[1].replaceAll(',', '')) : -1
    return bonus
  }

  protected async getSeedingInfo (): Promise<SeedingInfo> {
    const seedingTorrents = await this.parsePagination(
      '/bonus.php?action=bprates', this.parseSeedingInfoPage, 1
    )
    const seeding = seedingTorrents.length
    let seedingSize = 0
    seedingTorrents.forEach(t => { seedingSize += t.size })
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
      if (id) {
        seedingTorrents.push({ id, size })
      }
    }
    return seedingTorrents
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected parseTorrentTitle (g: GGroup, t: GTorrent): string {
    let title = g.groupSubName ? `${g.groupSubName} - ` : ''
    title += `${unescapeHTML(g.groupName)} [${g.groupYear}]`
    return title
  }

  protected parseTorrentSubTitle (group: GGroup, t: GTorrent): string {
    let subTitle = ''
    subTitle += t.codec ? `${t.codec} / ` : ''
    subTitle += t.source ? `${t.source} / ` : ''
    subTitle += t.processing ? `${t.processing} / ` : ''
    subTitle += t.resolution ? `${unescapeHTML(t.resolution)} / ` : ''
    subTitle += t.container ? `${t.container}` : ''
    subTitle += t.scene ? ' / Scene' : ''
    return subTitle
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected parseTorrentCatagory (group: GGroup, torrent?: GTorrent): ETorrentCatagory {
    return ETorrentCatagory.movies
  }
}

const greatposterwall = new GPW({
  name: 'GPW',
  url: 'https://greatposterwall.com/'
})

export default greatposterwall
