import NexusPHPSite from './model/nexusPHPSite'
import { ESiteCatagory } from './model/site'

class SSD extends NexusPHPSite {
  protected parseBonus (query: JQuery<Document>): number {
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
  catagory: ESiteCatagory.general,
  tags: [
    ESiteCatagory.hd,
    ESiteCatagory.movies,
    ESiteCatagory.tv
  ]
})

export default springsunday
