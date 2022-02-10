import Unit3D from '../model/unit3D'
import { ETorrentCatagory, ETorrentPromotion } from '../enum'
import { TorrentPromotion } from '../types'
import { parseTimeAgo } from '../utils'

class AsianCinema extends Unit3D {
  protected tableIndex = {
    size: 5,
    seeders: 6,
    leechers: 7,
    snatched: 8,
    releaseDate: 4
  }

  protected parseTorrentCatagory = (query: JQuery<HTMLElement>): ETorrentCatagory => {
    const catagoryString = query.find('a[href*="/categories/"]').first().attr('href')
    const catagoryMatch = catagoryString ? catagoryString.match(/categories\/(\d+)/) : undefined
    const catagory = catagoryMatch ? catagoryMatch[1] : undefined
    if (catagory === '1') {
      return ETorrentCatagory.movies
    }
    if (catagory === '2') {
      return ETorrentCatagory.tv
    }
    if (catagory === '3') {
      return ETorrentCatagory.music
    }
    return ETorrentCatagory.undefined
  }

  protected parseTorrentPromotion = (query: JQuery<HTMLElement>): TorrentPromotion|undefined => {
    const status = ETorrentPromotion.free
    if (query.find('i.fas.fa-star.text-gold').length) {
      return { status, isTemporary: false }
    }
    if (query.find('i.fas.fa-certificate.text-pink').length) {
      return { status, isTemporary: true }
    }
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
  url: 'https://asiancinema.me/'
})

export default asiancinema
