import Unit3D from '../model/unit3D'
import { ETorrentCatagory, ETorrentPromotion } from '../enum'
import type { TorrentPromotion } from '../types'
import { parseTimeAgo } from '../utils'

class AsianCinema extends Unit3D {
  protected tableIndex = {
    size: 5,
    seeders: 6,
    leechers: 7,
    snatched: 8,
    releaseDate: 4,
  }

  protected parseTorrentCatagory = (query: JQuery<HTMLElement>): ETorrentCatagory => {
    const map = new Map()
    map.set('1', ETorrentCatagory.movies)
    map.set('2', ETorrentCatagory.tv)
    map.set('3', ETorrentCatagory.music)
    const cKey = this.parseTorrentCatagoryKey(query)
    const catagory = cKey ? map.get(cKey) : undefined
    return catagory || ETorrentCatagory.other
  }

  protected parseTorrentPromotion = (query: JQuery<HTMLElement>): TorrentPromotion | undefined => {
    const status = ETorrentPromotion.free
    if (query.find('i.fas.fa-star.text-gold').length)
      return { status, isTemporary: false }

    if (query.find('i.fas.fa-certificate.text-pink').length)
      return { status, isTemporary: true }

    return undefined
  }

  protected parseTorrentReleaseDate = (query: JQuery<HTMLElement>): number => {
    let dateString = query.find('> td').eq(this.tableIndex.releaseDate).text().trim()
    dateString = dateString.replace('秒', ' seconds')
      .replace('分钟', ' minutes')
      .replace('分鐘', ' minutes')
      .replace('小時', ' hours')
      .replace('小时', ' hours')
      .replace('天', ' days')
      .replace('週', ' weeks')
      .replace('周', ' weeks')
      .replace('個月', ' months')
      .replace('个月', ' months')
      .replace('年', ' years')
    return parseTimeAgo(dateString)
  }
}

const asiancinema = new AsianCinema({
  name: 'AsianCinema',
  url: 'https://asiancinema.me/',
})

export default asiancinema
