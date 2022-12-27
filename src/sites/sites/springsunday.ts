import NexusPHPSite from '../model/nexusPHPSite'
import { ETorrentCatagory } from '../enum'

class SSD extends NexusPHPSite {
  protected tableIndex = {
    releaseDate: 3,
    size: 4,
    seeders: 5,
    leechers: 6,
    snatched: 7,
  }

  protected parseBonus(query: JQuery<Document>): number {
    let bonusString = this.someSelector(query, [
      'td.rowhead:contains("积分")',
      'td.rowhead:contains("積分")',
      'td.rowhead:contains("Karma"):contains("Points")',
    ]).next().text().replaceAll(',', '')
    const bonusMatch = bonusString.match(/(魔力值|Bonus Points).+?(\d+\.?\d*)/)
    bonusString = bonusMatch ? bonusMatch[2] : ''
    const bonus = parseFloat(bonusString)
    return bonus
  }

  protected parseTorrentSeeding = (query: JQuery<HTMLElement>): boolean | undefined => {
    return !!query.find('div.p_seeding').length
  }

  protected parseTorrentSubTitle = (query: JQuery<HTMLElement>): string | undefined => {
    return query.find('a[href*="details.php?id="]').first().parent().contents().filter(
      (index, content) => content.nodeType === 3,
    ).text().trim()
  }

  protected parseTorrentCatagory = (query: JQuery<HTMLElement>): ETorrentCatagory => {
    const map = new Map()
    map.set('501', ETorrentCatagory.movies)
    map.set('502', ETorrentCatagory.tv)
    map.set('503', ETorrentCatagory.documentary)
    map.set('504', ETorrentCatagory.animation)
    map.set('505', ETorrentCatagory.tv)
    map.set('506', ETorrentCatagory.sports)
    map.set('507', ETorrentCatagory.mv)
    map.set('508', ETorrentCatagory.music)
    map.set('509', ETorrentCatagory.other)
    const cKey = this.parseTorrentCatagoryKey(query)
    const catagory = cKey ? map.get(cKey) : undefined
    return catagory || ETorrentCatagory.other
  }
}

const springsunday = new SSD({
  name: 'SSD',
  url: 'https://springsunday.net/',
})

export default springsunday
