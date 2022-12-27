import NexusPHPSite from '../model/nexusPHPSite'
import { ETorrentCatagory } from '../enum'

class HDDolby extends NexusPHPSite {
  protected parseTorrentCatagory = (query: JQuery<HTMLElement>): ETorrentCatagory => {
    const map = new Map()
    map.set('401', ETorrentCatagory.movies)
    map.set('402', ETorrentCatagory.tv)
    map.set('404', ETorrentCatagory.documentary)
    map.set('405', ETorrentCatagory.animation)
    map.set('403', ETorrentCatagory.tv)
    map.set('406', ETorrentCatagory.mv)
    map.set('407', ETorrentCatagory.sports)
    map.set('408', ETorrentCatagory.music)
    map.set('410', ETorrentCatagory.games)
    map.set('411', ETorrentCatagory.learning)
    map.set('409', ETorrentCatagory.other)
    const cKey = this.parseTorrentCatagoryKey(query)
    const catagory = cKey ? map.get(cKey) : undefined
    return catagory || ETorrentCatagory.other
  }

  protected parseTorrentSeeding = (query: JQuery<HTMLElement>): boolean | undefined => {
    const seedingString = query.find('> td').eq(8).text()
    const seeding = !!seedingString.match(/Seeding/)
    return seeding
  }

  protected parseTorrentSubTitle = (query: JQuery<HTMLElement>): string | undefined => {
    return query.find('a[href*="details.php?id="]').first().parent().find('> span').last().text()
  }
}

const hddolby = new HDDolby({
  name: 'HDDolby',
  url: 'https://www.hddolby.com/',
})

export default hddolby
