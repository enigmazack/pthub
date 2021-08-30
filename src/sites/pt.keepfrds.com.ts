/* eslint-disable @typescript-eslint/no-explicit-any */
import NexusPHPSite from './model/nexusPHPSite'
import { SiteCatagory } from './model/site'

class FRDS extends NexusPHPSite {
  protected parseBonus (query: JQuery<any>): number {
    const bonusString = this.someSelector(query, [
      'td.rowhead:contains("魔力值")',
      'td.rowhead:contains("Karma"):contains("Points")'
    ]).next().text()
    const bonusMatch = bonusString.match(/(魔力值|Points):.+?(\d+,?\d*.?\d*)/)
    const bonus = bonusMatch ? parseFloat(bonusMatch[2].replaceAll(',', '')) : -1
    return bonus
  }
}

const keepfrds = new FRDS({
  name: 'keepfrds',
  url: 'https://pt.keepfrds.com/',
  abbreviation: 'FRDS',
  catagory: SiteCatagory.hd,
  tags: [
    SiteCatagory.movies,
    SiteCatagory.tv
  ]
})

export default keepfrds
