import NexusPHPSite from '../model/nexusPHPSite'

class FRDS extends NexusPHPSite {
  protected parseBonus (query: JQuery<Document>): number {
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
  name: 'Keepfrds',
  url: 'https://pt.keepfrds.com/'
})

export default keepfrds
