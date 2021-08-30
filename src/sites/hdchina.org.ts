/* eslint-disable @typescript-eslint/no-explicit-any */
import NexusPHPSite from './model/nexusPHPSite'
import { SiteCatagory } from './model/site'

class HDC extends NexusPHPSite {
  protected userTorrentPath = '/ajax_getusertorrentlist.php'

  protected async getSeedingInfoQuery (id: string): Promise<JQuery<any>> {
    // get x-csrf fire from index
    const rIndex = await this.get(this.indexPath)
    const qIndex = this.parseHTML(rIndex.data)
    const csrf = qIndex.find('meta[name="x-csrf"]').attr('content')
    // hdc use a post request to get seeding torrent info
    const rTorrent = await this.post(this.userTorrentPath,
      `userid=${id}&type=seeding&csrf=${csrf}`
    )
    const query = this.parseHTML(rTorrent.data.message)
    return query
  }

  protected parseSeedingInfoSeeding (query: JQuery<any>): number {
    const seedingString = query.find('body > p').first().text()
    const seeding = seedingString ? parseInt(seedingString) : -1
    return seeding
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
