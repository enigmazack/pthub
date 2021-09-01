import NexusPHPSite from './model/nexusPHPSite'

class OpenCD extends NexusPHPSite {
  protected parseUserName (query: JQuery<Document>): string {
    const name = query.find('div.infos-bar').find('a[href*="userdetails.php?id="]').first().text()
    return name
  }
}

const opencd = new OpenCD({
  name: 'OpenCD',
  url: 'https://open.cd/'
})

export default opencd
