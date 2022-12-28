import NexusPHPSite from '../model/nexusPHPSite'
import { ETorrentCatagory } from '../enum'

class OpenCD extends NexusPHPSite {
  protected tableIndex = {
    releaseDate: 5,
    size: 6,
    seeders: 7,
    leechers: 8,
    snatched: 9,
  }

  protected parseUserName(query: JQuery<Document>): string {
    const name = query.find('div.infos-bar').find('a[href*="userdetails.php?id="]').first().text()
    return name
  }

  protected parseTorrentCatagory = (_query: JQuery<HTMLElement>): ETorrentCatagory => {
    return ETorrentCatagory.music
  }

  protected parseTorrentSubTitle = (query: JQuery<HTMLElement>): string | undefined => {
    return query.find('a[href*="details.php?id="]').first().parent()
      .find('> font').last().text().trim()
  }

  protected parseTorrentSeeding = (query: JQuery<HTMLElement>): boolean | undefined => {
    return !!query.find('img[src*="seeding"]').length
  }
}

const opencd = new OpenCD({
  name: 'OpenCD',
  url: 'https://open.cd/',
})

export default opencd
