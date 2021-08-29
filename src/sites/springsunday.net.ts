/* eslint-disable @typescript-eslint/no-explicit-any */
import NexusPHPSite from './model/nexusPHPSite'
import { SiteCatagory } from './model/site'

class SSD extends NexusPHPSite {
  protected parseBonus (query: JQuery<any>): number {
    let bonusString = this.someSelector(query, [
      'td.rowhead:contains("积分")',
      'td.rowhead:contains("積分")',
      'td.rowhead:contains("Karma"):contains("Points")'
    ]).next().text().replaceAll(',', '')
    const bonusMatch = bonusString.match(/(魔力值|Bonus Points).+?(\d+\.?\d*)/)
    bonusString = bonusMatch ? bonusMatch[2] : ''
    const bonus = parseFloat(bonusString)
    return bonus
  }
}

const springsunday = new SSD({
  name: 'springsunday.net',
  url: 'https://springsunday.net/',
  abbreviation: 'SSD',
  catagory: SiteCatagory.general,
  tags: [
    SiteCatagory.movies,
    SiteCatagory.tv,
    SiteCatagory.animation
  ]
})

export default springsunday
