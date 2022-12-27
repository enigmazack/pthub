import NexusPHPSite from '../model/nexusPHPSite'
import { ETorrentCatagory } from '../enum'

class OB extends NexusPHPSite {
  protected parseTorrentSeeding = (query: JQuery<HTMLElement>): boolean | undefined => {
    return !!query.find('div.progressBar.doing[title*="100.00%"]').length
  }

  protected parseTorrentSubTitle = (query: JQuery<HTMLElement>): string | undefined => {
    return query.find('a[href*="details.php?id="]').first().parent().contents().filter(
      (index, content) => content.nodeType === 3,
    ).text().trim()
  }

  protected parseTorrentCatagory = (query: JQuery<HTMLElement>): ETorrentCatagory => {
    const map = new Map()
    map.set('401', ETorrentCatagory.movies)
    map.set('402', ETorrentCatagory.movies)
    map.set('419', ETorrentCatagory.mv)
    map.set('412', ETorrentCatagory.tv)
    map.set('405', ETorrentCatagory.tv)
    map.set('413', ETorrentCatagory.tv)
    map.set('410', ETorrentCatagory.documentary)
    map.set('411', ETorrentCatagory.animation)
    map.set('415', ETorrentCatagory.sports)
    map.set('414', ETorrentCatagory.mv)
    map.set('416', ETorrentCatagory.music)
    const cKey = this.parseTorrentCatagoryKey(query)
    const catagory = cKey ? map.get(cKey) : undefined
    return catagory || ETorrentCatagory.other
  }
}

const ourbits = new OB({
  name: 'OurBits',
  url: 'https://ourbits.club/',
})

export default ourbits
