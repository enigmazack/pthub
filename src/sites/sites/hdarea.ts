import NexusPHPSite from '../model/nexusPHPSite'
import { ETorrentCatagory } from '../enum'

class HDArea extends NexusPHPSite {
  protected parseTorrentCatagory = (query: JQuery<HTMLElement>): ETorrentCatagory => {
    const map = new Map()
    map.set('300', ETorrentCatagory.movies)
    map.set('415', ETorrentCatagory.movies)
    map.set('416', ETorrentCatagory.movies)
    map.set('401', ETorrentCatagory.movies)
    map.set('410', ETorrentCatagory.movies)
    map.set('411', ETorrentCatagory.movies)
    map.set('414', ETorrentCatagory.movies)
    map.set('412', ETorrentCatagory.movies)
    map.set('413', ETorrentCatagory.movies)
    map.set('417', ETorrentCatagory.movies)
    map.set('402', ETorrentCatagory.tv)
    map.set('404', ETorrentCatagory.documentary)
    map.set('405', ETorrentCatagory.animation)
    map.set('403', ETorrentCatagory.tv)
    map.set('406', ETorrentCatagory.mv)
    map.set('407', ETorrentCatagory.sports)
    map.set('408', ETorrentCatagory.music)
    map.set('409', ETorrentCatagory.other)
    const cKey = this.parseTorrentCatagoryKey(query)
    const catagory = cKey ? map.get(cKey) : undefined
    return catagory || ETorrentCatagory.other
  }

  protected parseTorrentSeeding = (query: JQuery<HTMLElement>): boolean | undefined => {
    return !!query.find('table[title*="seeding"]').length
  }

  protected parseTorrentSubTitle = (query: JQuery<HTMLElement>): string | undefined => {
    const titleTd = query.find('a[href*="details.php?id="]').first().parent()
    return titleTd.contents().filter((index, content) => content.nodeType === 3).text().trim()
  }
}

const hdarea = new HDArea({
  name: 'HDArea',
  url: 'https://www.hdarea.co/',
})

export default hdarea
