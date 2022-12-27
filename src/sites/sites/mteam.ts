import NexusPHPSite from '../model/nexusPHPSite'
import { ETorrentCatagory } from '../enum'
import type { SeedingInfo, SeedingTorrentInfo } from '../types'
import { parseSize } from '../utils'

class MT extends NexusPHPSite {
  protected async getSeedingInfo(): Promise<SeedingInfo> {
    const seedingTorrents = await this.parsePagination(
      '/getusertorrentlist.php?userid=6719&type=seeding', this.parseSeedingInfoPage, 0,
    )
    const seeding = seedingTorrents.length
    let seedingSize = 0
    seedingTorrents.forEach((t) => { seedingSize += t.size })
    const seedingList = seedingTorrents.map(t => t.id)
    return { seeding, seedingSize, seedingList }
  }

  private parseSeedingInfoPage = (query: JQuery<Document>): SeedingTorrentInfo[] => {
    const seedingTorrents: SeedingTorrentInfo[] = []
    const rows = query.find('a[href*="details.php?id="]:not(:eq(0))')
    for (let i = 0; i < rows.length; i++) {
      const row = rows.eq(i)
      const idString = row.attr('href')
      const idMatch = idString ? idString.match(/id=(\d+)/) : undefined
      const id = idMatch ? idMatch[1] : undefined
      const sizeString = row.parent().next().text()
      const size = sizeString ? parseSize(sizeString) : 0
      if (id)
        seedingTorrents.push({ id, size })
    }
    return seedingTorrents
  }

  protected parseTorrentCatagory = (query: JQuery<HTMLElement>): ETorrentCatagory => {
    const map = new Map()
    map.set('401', ETorrentCatagory.movies)
    map.set('419', ETorrentCatagory.movies)
    map.set('420', ETorrentCatagory.movies)
    map.set('421', ETorrentCatagory.movies)
    map.set('439', ETorrentCatagory.movies)
    map.set('404', ETorrentCatagory.documentary)
    map.set('403', ETorrentCatagory.tv)
    map.set('402', ETorrentCatagory.tv)
    map.set('435', ETorrentCatagory.tv)
    map.set('438', ETorrentCatagory.tv)
    map.set('405', ETorrentCatagory.animation)
    map.set('407', ETorrentCatagory.sports)
    map.set('422', ETorrentCatagory.application)
    map.set('423', ETorrentCatagory.games)
    map.set('427', ETorrentCatagory.ebook)
    map.set('409', ETorrentCatagory.other)
    const cKey = this.parseTorrentCatagoryKey(query)
    const catagory = cKey ? map.get(cKey) : undefined
    return catagory || ETorrentCatagory.other
  }

  protected parseTorrentSubTitle = (query: JQuery<HTMLElement>): string | undefined => {
    const titleString = query.find('a[href*="details.php?id="]').eq(1).parent().html()
    const subTitle = titleString ? titleString.split('>').pop() : undefined
    return subTitle
  }
}

const mteam = new MT({
  name: 'MTeam',
  url: 'https://kp.m-team.cc/',
})

export default mteam
