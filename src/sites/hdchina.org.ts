import { ETorrentCatagory, ESiteCatagory } from './model/enum'
import NexusPHPSite from './model/nexusPHPSite'

interface HDCPromotion {
  // eslint-disable-next-line camelcase
  sp_state: string,
  timeout: string
}

interface HDCPromotionMessage {
  [id: string]: HDCPromotion
}

interface HDCPromotionData {
  status: number,
  message: HDCPromotionMessage
}

class HDC extends NexusPHPSite {
  protected userTorrentPath = '/ajax_getusertorrentlist.php'
  protected promotionPath = '/ajax_promotion.php'

  protected async getSeedingInfoQuery (id: string): Promise<JQuery<Document>> {
    // get x-csrf fire from index
    const rIndex = await this.get(this.indexPath)
    const qIndex = this.parseHTML(rIndex.data)
    const csrf = qIndex.find('meta[name="x-csrf"]').attr('content') || ''
    // hdc use a post request to get seeding torrent info
    const params = new URLSearchParams()
    params.append('userid', id)
    params.append('type', 'seeding')
    params.append('csrf', csrf)
    const rTorrent = await this.post(this.userTorrentPath, params)
    const query = this.parseHTML(rTorrent.data.message)
    return query
  }

  protected async getTorrentPageQuery (path: string): Promise<JQuery<Document>> {
    const r = await this.get(path)
    const query = this.parseHTML(r.data)
    try {
      const csrf = query.find('meta[name="x-csrf"]').attr('content') || ''
      const torrents = query.find('span.sp_state_placeholder').map(function () {
        return this.id
      }).toArray()
      const params = new URLSearchParams()
      for (const id of torrents) {
        params.append('ids[]', id)
      }
      params.append('csrf', csrf)
      const rPromotion = await this.post(this.promotionPath, params)
      const response: HDCPromotionData = rPromotion.data
      for (const [key, value] of Object.entries(response.message)) {
        query.find('span#' + key + '.sp_state_placeholder').replaceWith('<p>' + value.sp_state + '</p>' + value.timeout)
      }
    } catch {
      return query
    }
    return query
  }

  protected parseSeedingInfoSeeding (query: JQuery<Document>): number {
    const seedingString = query.find('body > p').first().text()
    const seeding = seedingString ? parseInt(seedingString) : -1
    return seeding
  }

  protected getTorrentTable (query: JQuery<Document>): JQuery<HTMLElement> {
    return query.find('table.torrent_list').last()
  }

  protected parseTorrentDownloadUrl (query: JQuery<HTMLElement>): string {
    const hashString = query.find('a[href*="download.php?hash="]').attr('href')
    const hashMacth = hashString ? hashString.match(/hash=(.+)/) : undefined
    const hash = hashMacth ? hashMacth[1] : ''
    const url = new URL(this.url.href)
    url.pathname = this.torrentDownloadPath
    url.searchParams.set('hash', hash)
    const downloadUrl = url.href
    return downloadUrl
  }

  protected parseTorrentSubTitle (query: JQuery<HTMLElement>): string {
    const titleString = query.find('a[href*="details.php?id="]').parent().parent().find('h4').text().trim()
    const subTitle = titleString || ''
    return subTitle
  }

  protected parseTorrentCatagoryKey (query: JQuery<HTMLElement>): string {
    const cString = query.find('a[href*="?cat="]').attr('href')
    const cMatch = cString ? cString.match(/\?cat=(\d+)/) : undefined
    const cNum = cMatch ? cMatch[1] : undefined
    return cNum || ''
  }

  protected parseTorrentCatagory (query: JQuery<HTMLElement>): ETorrentCatagory {
    const map = new Map()
    map.set('20', ETorrentCatagory.movies)
    map.set('17', ETorrentCatagory.movies)
    map.set('16', ETorrentCatagory.movies)
    map.set('9', ETorrentCatagory.movies)
    map.set('13', ETorrentCatagory.tvEpisode)
    map.set('25', ETorrentCatagory.tvEpisode)
    map.set('26', ETorrentCatagory.tvEpisode)
    map.set('24', ETorrentCatagory.tvEpisode)
    map.set('21', ETorrentCatagory.tvSeason)
    map.set('22', ETorrentCatagory.tvSeason)
    map.set('23', ETorrentCatagory.tvSeason)
    map.set('27', ETorrentCatagory.movies)
    map.set('5', ETorrentCatagory.documentary)
    map.set('15', ETorrentCatagory.sports)
    map.set('14', ETorrentCatagory.animation)
    map.set('401', ETorrentCatagory.tvShow)
    map.set('402', ETorrentCatagory.mv)
    map.set('406', ETorrentCatagory.mv)
    map.set('408', ETorrentCatagory.music)
    map.set('19', ETorrentCatagory.audio)
    map.set('405', ETorrentCatagory.opera)
    map.set('404', ETorrentCatagory.ebook)
    map.set('409', ETorrentCatagory.other)
    map.set('410', ETorrentCatagory.movies)
    map.set('411', ETorrentCatagory.other)
    map.set('412', ETorrentCatagory.other)
    const cKey = this.parseTorrentCatagoryKey(query)
    const catagory = map.get(cKey)
    return catagory || ETorrentCatagory.other
  }
}

const hdchina = new HDC({
  name: 'hdchina.org',
  url: 'https://hdchina.org/',
  abbreviation: 'HDC',
  catagory: ESiteCatagory.general,
  tags: [
    ESiteCatagory.movies,
    ESiteCatagory.tv
  ]
})

export default hdchina
