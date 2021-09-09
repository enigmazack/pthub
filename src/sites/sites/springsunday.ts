import NexusPHPSite from '../model/nexusPHPSite'

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
  name: 'SSD',
  url: 'https://springsunday.net/'
})

export default springsunday
