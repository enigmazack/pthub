import {
  ETorrentCatagory,
  ETorrentPromotion
} from './model/enum'
import NexusPHPSite from './model/nexusPHPSite'
import { TorrentPromotion } from './model/site'

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
    // try get torrent promotion info
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
        query.find(`span#${key}.sp_state_placeholder`).replaceWith(`<p>${value.sp_state}</p>${value.timeout}`)
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

  // HDC use a different torrent table selector
  protected findTorrentRows (query: JQuery<Document>): JQuery<HTMLElement> {
    const table = query.find('table.torrent_list').last()
    const rows = table.find('> tbody > tr:not(:eq(0))')
    return rows
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
    const catagory = cKey ? map.get(cKey) : undefined
    return catagory || ETorrentCatagory.other
  }

  protected parseTorrentPromotion (query: JQuery<HTMLElement>): TorrentPromotion|undefined {
    const map = new Map()
    map.set('pro_free', ETorrentPromotion.free)
    map.set('pro_2up', ETorrentPromotion.double)
    map.set('pro_free2up', ETorrentPromotion.doubleFree)
    map.set('pro_50pctdown', ETorrentPromotion.half)
    map.set('pro_50pctdown2up', ETorrentPromotion.doubleHalf)
    map.set('pro_30pctdown', ETorrentPromotion.thirtyPercent)
    const statusString = query.find('td.discount > p > img').attr('class')
    const status = statusString ? map.get(statusString) : undefined
    const expireString = query.find('td.discount > span').attr('title')
    const expire = expireString ? Date.parse(expireString) : undefined
    const promotion = status ? this.genTorrentPromotion(status, expire) : undefined
    return promotion
  }

  protected parseTorrentSeeding (query: JQuery<HTMLElement>): boolean {
    const seedingString = query.find('div.progress >  div').attr('class')
    const seeding = seedingString === 'progress_seeding'
    return seeding
  }
}

const hdchina = new HDC({
  name: 'HDChina',
  url: 'https://hdchina.org/'
})

export default hdchina
