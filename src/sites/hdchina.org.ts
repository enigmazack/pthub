import NexusPHPSite from './model/nexusPHPSite'
import { SiteCatagory, SeedingInfo } from './model/site'

class HDC extends NexusPHPSite {
  protected userTorrentPath = '/ajax_getusertorrentlist.php'
  protected async getSeedingInfo (id: string): Promise<SeedingInfo> {
    // get x-csrf fire from index
    const rIndex = await this.get(this.indexPath)
    const qIndex = this.parseHTML(rIndex.data)
    const csrf = qIndex.find('meta[name="x-csrf"]').attr('content')
    if (!csrf) {
      return { seeding: -1, seedingSize: -1 }
    }
    // hdc use a post request to get seeding torrent info
    const rTorrent = await this.post(this.userTorrentPath,
      `userid=${id}&type=seeding&csrf=${csrf}`
    )
    const query = this.parseHTML(rTorrent.data.message)
    // selector p instead of b
    const seedingString = query.find('p').first().text()
    const seeding = parseInt(seedingString)
    const rows = query.find('tr')
    let seedingSize = 0
    const seedingList: string[] = []
    for (let i = 1; i < rows.length; i++) {
      const row = rows.eq(i)
      const torrentIdString = row.find('a[href*="details.php?id="]').attr('href')
      const torrentIdMatch = torrentIdString ? torrentIdString.match(/details.php\?id=(\d+)/) : undefined
      const torrentId = torrentIdMatch ? torrentIdMatch[1] : undefined
      if (torrentId) {
        seedingList.push(torrentId)
      }
      const torrentSizeString = row.find('td').eq(2).text()
      const torrentSizeThis = torrentSizeString ? this.parseSize(torrentSizeString) : 0
      seedingSize += torrentSizeThis
    }
    return { seeding, seedingSize, seedingList }
  }
}

const hdchina = new HDC({
  name: 'hdchina.org',
  url: 'https://hdchina.org/',
  abbreviation: 'HDC',
  catagory: SiteCatagory.hd,
  tags: [
    SiteCatagory.movies,
    SiteCatagory.tv,
    SiteCatagory.animation
  ]
})

export default hdchina
