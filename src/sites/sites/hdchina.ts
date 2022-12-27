import NexusPHPSite from '../model/nexusPHPSite'
import { ETorrentCatagory, ETorrentPromotion } from '../enum'
import type { TorrentPromotion } from '../types'

interface HDCPromotion {

  sp_state: string
  timeout: string
}

interface HDCPromotionMessage {
  [id: string]: HDCPromotion
}

interface HDCPromotionData {
  status: number
  message: HDCPromotionMessage
}

class HDC extends NexusPHPSite {
  // protected userTorrentPath = '/ajax_getusertorrentlist.php'
  // protected promotionPath = '/ajax_promotion.php'
  protected csrf = ''

  protected async getCsrf(): Promise<void> {
    if (!this.csrf) {
      const rIndex = await this.get('/index.php')
      const qIndex = this.parseHTML(rIndex.data)
      const csrf = qIndex.find('meta[name="x-csrf"]').attr('content') || ''
      this.csrf = csrf
    }
  }

  protected async getSeedingInfoAsQuery(): Promise<JQuery<Document>> {
    await this.getCsrf()
    // hdc use a post request to get seeding torrent info
    const params = new URLSearchParams()
    params.append('userid', this.userId)
    params.append('type', 'seeding')
    params.append('csrf', this.csrf)
    const rTorrent = await this.post('/ajax_getusertorrentlist.php', params)
    const query = this.parseHTML(rTorrent.data.message)
    return query
  }

  protected async parsePagination<T>(
    path: string,
    parseFunction: (query: JQuery<Document>) => T[],
    start: 0 | 1,
    maxCounts?: number,
  ): Promise<T[]> {
    const url = this.parseUrlPath(path)
    const qStart = await this.getTorrentPageAsQuery(url.pathname + url.search)
    const maxPage = this.parseMaxPage(qStart)
    let list = parseFunction(qStart)
    let currentPage = start
    while (currentPage <= maxPage) {
      currentPage += 1
      if (maxCounts && maxCounts <= list.length)
        break
      url.searchParams.set('page', currentPage.toString())
      const qNext = await this.getTorrentPageAsQuery(url.pathname + url.search)
      const addition = parseFunction(qNext)
      list = list.concat(addition)
    }
    return list
  }

  protected getTorrentPageAsQuery = async (path: string): Promise<JQuery<Document>> => {
    const query = await this.getAsQuery(path)
    // try get torrent promotion info
    try {
      const csrf = query.find('meta[name="x-csrf"]').attr('content') || ''
      const torrents = query.find('span.sp_state_placeholder').map(function () {
        return this.id
      }).toArray()
      const params = new URLSearchParams()
      for (const id of torrents)
        params.append('ids[]', id)

      params.append('csrf', csrf)
      const rPromotion = await this.post('/ajax_promotion.php', params)
      const response: HDCPromotionData = rPromotion.data
      for (const [key, value] of Object.entries(response.message))
        query.find(`span#${key}.sp_state_placeholder`).replaceWith(`<p>${value.sp_state}</p>${value.timeout}`)
    }
    catch {
      return query
    }
    // console.log(query.find('body').html())
    return query
  }

  protected findTorrentRows = (query: JQuery<Document>): JQuery<HTMLElement> => {
    const table = query.find('table.torrent_list').last()
    const rows = table.find('> tbody > tr:not(:eq(0))')
    return rows
  }

  protected parseTorrentDownloadUrl = (query: JQuery<HTMLElement>): string => {
    const hashString = query.find('a[href*="download.php?hash="]').attr('href')
    const hashMacth = hashString ? hashString.match(/hash=(.+)/) : undefined
    const hash = hashMacth ? hashMacth[1] : ''
    const url = new URL(this.url.href)
    url.pathname = '/download.php'
    url.searchParams.set('hash', hash)
    const downloadUrl = url.href
    return downloadUrl
  }

  protected parseTorrentSubTitle = (query: JQuery<HTMLElement>): string => {
    const titleString = query.find('a[href*="details.php?id="]').parent().parent().find('h4').text().trim()
    const subTitle = titleString || ''
    return subTitle
  }

  protected parseTorrentCatagory = (query: JQuery<HTMLElement>): ETorrentCatagory => {
    const map = new Map()
    map.set('20', ETorrentCatagory.movies)
    map.set('17', ETorrentCatagory.movies)
    map.set('16', ETorrentCatagory.movies)
    map.set('9', ETorrentCatagory.movies)
    map.set('13', ETorrentCatagory.tv)
    map.set('25', ETorrentCatagory.tv)
    map.set('26', ETorrentCatagory.tv)
    map.set('24', ETorrentCatagory.tv)
    map.set('21', ETorrentCatagory.tv)
    map.set('22', ETorrentCatagory.tv)
    map.set('23', ETorrentCatagory.tv)
    map.set('27', ETorrentCatagory.movies)
    map.set('5', ETorrentCatagory.documentary)
    map.set('15', ETorrentCatagory.sports)
    map.set('14', ETorrentCatagory.animation)
    map.set('401', ETorrentCatagory.tv)
    map.set('402', ETorrentCatagory.mv)
    map.set('406', ETorrentCatagory.mv)
    map.set('408', ETorrentCatagory.music)
    map.set('19', ETorrentCatagory.other)
    map.set('405', ETorrentCatagory.other)
    map.set('404', ETorrentCatagory.ebook)
    map.set('409', ETorrentCatagory.other)
    map.set('410', ETorrentCatagory.movies)
    map.set('411', ETorrentCatagory.other)
    map.set('412', ETorrentCatagory.other)
    const cKey = this.parseTorrentCatagoryKey(query)
    const catagory = cKey ? map.get(cKey) : undefined
    return catagory || ETorrentCatagory.other
  }

  protected parseTorrentPromotion = (query: JQuery<HTMLElement>): TorrentPromotion | undefined => {
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
    const isTemporary = !!expireString
    const promotion = status ? { status, isTemporary } : undefined
    return promotion
  }

  protected parseTorrentSeeding = (query: JQuery<HTMLElement>): boolean => {
    const seedingString = query.find('div.progress >  div').attr('class')
    const seeding = seedingString === 'progress_seeding'
    return seeding
  }
}

const hdchina = new HDC({
  name: 'HDChina',
  url: 'https://hdchina.org/',
})

export default hdchina
