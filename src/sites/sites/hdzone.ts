import NexusPHPSite from '../model/nexusPHPSite'
import { ETorrentCatagory } from '../enum'

class HDZone extends NexusPHPSite {
  protected parseTorrentCatagory = (query: JQuery<HTMLElement>): ETorrentCatagory => {
    const map = new Map()
    map.set('411', ETorrentCatagory.movies)
    map.set('412', ETorrentCatagory.movies)
    map.set('413', ETorrentCatagory.movies)
    map.set('414', ETorrentCatagory.movies)
    map.set('415', ETorrentCatagory.movies)
    map.set('450', ETorrentCatagory.movies)
    map.set('449', ETorrentCatagory.movies)
    map.set('416', ETorrentCatagory.movies)
    map.set('417', ETorrentCatagory.documentary)
    map.set('418', ETorrentCatagory.documentary)
    map.set('419', ETorrentCatagory.documentary)
    map.set('420', ETorrentCatagory.documentary)
    map.set('421', ETorrentCatagory.documentary)
    map.set('451', ETorrentCatagory.documentary)
    map.set('500', ETorrentCatagory.documentary)
    map.set('422', ETorrentCatagory.documentary)
    map.set('423', ETorrentCatagory.tv)
    map.set('424', ETorrentCatagory.tv)
    map.set('425', ETorrentCatagory.tv)
    map.set('426', ETorrentCatagory.tv)
    map.set('471', ETorrentCatagory.tv)
    map.set('427', ETorrentCatagory.tv)
    map.set('472', ETorrentCatagory.tv)
    map.set('428', ETorrentCatagory.tv)
    map.set('429', ETorrentCatagory.tv)
    map.set('430', ETorrentCatagory.tv)
    map.set('452', ETorrentCatagory.tv)
    map.set('431', ETorrentCatagory.tv)
    map.set('432', ETorrentCatagory.tv)
    map.set('433', ETorrentCatagory.tv)
    map.set('434', ETorrentCatagory.tv)
    map.set('435', ETorrentCatagory.tv)
    map.set('436', ETorrentCatagory.tv)
    map.set('437', ETorrentCatagory.tv)
    map.set('453', ETorrentCatagory.tv)
    map.set('438', ETorrentCatagory.tv)
    map.set('439', ETorrentCatagory.music)
    map.set('440', ETorrentCatagory.music)
    map.set('441', ETorrentCatagory.mv)
    map.set('442', ETorrentCatagory.sports)
    map.set('443', ETorrentCatagory.sports)
    map.set('444', ETorrentCatagory.animation)
    map.set('445', ETorrentCatagory.animation)
    map.set('446', ETorrentCatagory.animation)
    map.set('447', ETorrentCatagory.animation)
    map.set('448', ETorrentCatagory.animation)
    map.set('454', ETorrentCatagory.animation)
    map.set('449', ETorrentCatagory.animation)
    map.set('501', ETorrentCatagory.animation)
    map.set('409', ETorrentCatagory.other)
    const cKey = this.parseTorrentCatagoryKey(query)
    const catagory = cKey ? map.get(cKey) : undefined
    return catagory || ETorrentCatagory.other
  }

  protected parseTorrentSeeding = (_query: JQuery<HTMLElement>): boolean | undefined => {
    return undefined
  }
}

const hdzone = new HDZone({
  name: 'HDZone',
  url: 'https://hdzone.me/',
})

export default hdzone
