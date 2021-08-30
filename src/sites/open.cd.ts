/* eslint-disable @typescript-eslint/no-explicit-any */
import NexusPHPSite from './model/nexusPHPSite'
import { SiteCatagory } from './model/site'

class OpenCD extends NexusPHPSite {
  protected parseUserName (query: JQuery<any>): string {
    const name = query.find('div.infos-bar').find('a[href*="userdetails.php?id="]').first().text()
    return name
  }
}

const opencd = new OpenCD({
  name: 'opencd',
  url: 'https://open.cd/',
  abbreviation: 'OpenCD',
  catagory: SiteCatagory.music,
  tags: [
    SiteCatagory.music
  ]
})

export default opencd
