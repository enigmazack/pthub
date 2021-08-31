import NexusPHPSite from './model/nexusPHPSite'
import { ESiteCatagory } from './model/site'

class OpenCD extends NexusPHPSite {
  protected parseUserName (query: JQuery<Document>): string {
    const name = query.find('div.infos-bar').find('a[href*="userdetails.php?id="]').first().text()
    return name
  }
}

const opencd = new OpenCD({
  name: 'opencd',
  url: 'https://open.cd/',
  abbreviation: 'OpenCD',
  catagory: ESiteCatagory.music,
  tags: [
    ESiteCatagory.music
  ]
})

export default opencd
