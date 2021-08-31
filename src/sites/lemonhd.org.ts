import NexusPHPSite from './model/nexusPHPSite'
import { ESiteCatagory, SeedingInfo } from './model/site'

class LHD extends NexusPHPSite {
  protected async getSeedingInfo (id: string): Promise<SeedingInfo> {
    const url = new URL(this.url.href)
    url.pathname = this.userPath
    url.searchParams.set('id', id)
    const r = await this.get(url.pathname + url.search)
    const query = this.parseHTML(r.data)
    const seedingString = this.someSelector(query, [
      'td.rowhead:contains("做种统计")'
    ]).next().text()
    const seedingMatch = seedingString.match(/总做种数.+?(\d+).+?总做种体积.+?(\d+\.?\d* *[ZEPTGMK]?i?B)/)
    const seeding = seedingMatch ? parseInt(seedingMatch[1]) : -1
    const seedingSize = seedingMatch ? this.parseSize(seedingMatch[2]) : -1
    // lhd has no seeding list info
    return { seeding, seedingSize }
  }
}

const lemonhd = new LHD({
  name: 'lemonhd.org',
  url: 'https://lemonhd.org/',
  abbreviation: 'LHD',
  catagory: ESiteCatagory.general,
  tags: [
    ESiteCatagory.hd,
    ESiteCatagory.movies,
    ESiteCatagory.tv
  ]
})

export default lemonhd
