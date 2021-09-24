import NexusPHPSite from '../model/nexusPHPSite'
import { ETorrentCatagory } from '../enum'

class OpenCD extends NexusPHPSite {
  protected parseUserName (query: JQuery<Document>): string {
    const name = query.find('div.infos-bar').find('a[href*="userdetails.php?id="]').first().text()
    return name
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected parseTorrentCatagory = (query: JQuery<HTMLElement>): ETorrentCatagory => {
    return ETorrentCatagory.music
  }

  protected parseTorrentSeeding = (query: JQuery<HTMLElement>): boolean|undefined => {
    return !!query.find('img[src*="seeding"]').length
  }
}

const opencd = new OpenCD({
  name: 'OpenCD',
  url: 'https://open.cd/'
})

export default opencd
