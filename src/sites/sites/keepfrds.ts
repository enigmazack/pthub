import NexusPHPSite from '../model/nexusPHPSite'
import { ETorrentCatagory } from '../enum'

class FRDS extends NexusPHPSite {
  protected parseBonus(query: JQuery<Document>): number {
    const bonusString = this.someSelector(query, [
      'td.rowhead:contains("魔力值")',
      'td.rowhead:contains("Karma"):contains("Points")',
    ]).next().text()
    const bonusMatch = bonusString.match(/(魔力值|Points):.+?(\d+,?\d*.?\d*)/)
    const bonus = bonusMatch ? parseFloat(bonusMatch[2].replaceAll(',', '')) : -1
    return bonus
  }

  protected parseTorrentSubTitle = (query: JQuery<HTMLElement>): string => {
    return query.find('a[href*="details.php?id="]').attr('title') || ''
  }

  protected parseTorrentTitle = (query: JQuery<HTMLElement>): string => {
    const titleTd = query.find('a[href*="details.php?id="]').first().parent()
    return titleTd.contents().filter((index, content) => content.nodeType === 3).text().trim()
      || titleTd.find('> font').first().contents().filter((index, content) => content.nodeType === 3).text().trim()
  }

  protected parseTorrentSeeding = (query: JQuery<HTMLElement>): boolean | undefined => {
    return !!query.find('img[src*="up"]').length
  }

  protected parseTorrentCatagory = (query: JQuery<HTMLElement>): ETorrentCatagory => {
    const map = new Map()
    map.set('401', ETorrentCatagory.movies)
    map.set('301', ETorrentCatagory.movies)
    map.set('404', ETorrentCatagory.documentary)
    map.set('304', ETorrentCatagory.documentary)
    map.set('405', ETorrentCatagory.animation)
    map.set('305', ETorrentCatagory.animation)
    map.set('402', ETorrentCatagory.tv)
    map.set('302', ETorrentCatagory.tv)
    map.set('403', ETorrentCatagory.tv)
    map.set('303', ETorrentCatagory.tv)
    const cKey = this.parseTorrentCatagoryKey(query)
    const catagory = cKey ? map.get(cKey) : undefined
    return catagory || ETorrentCatagory.other
  }
}

const keepfrds = new FRDS({
  name: 'Keepfrds',
  url: 'https://pt.keepfrds.com/',
  icon: '/static/favicon-64x64.png',
})

export default keepfrds
