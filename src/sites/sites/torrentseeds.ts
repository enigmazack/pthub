import Unit3D from '../model/unit3D'
import { ESiteStatus, ETorrentCatagory } from '../enum'
import type { TorrentInfo, TorrentPromotion } from '../types'

class TS extends Unit3D {
  protected tableIndex = {
    size: 5,
    seeders: 6,
    leechers: 7,
    snatched: 8,
    releaseDate: 9,
  }

  async search(keywords: string, expectTorrents: number, pattern?: string): Promise<TorrentInfo[] | ESiteStatus> {
    try {
      if (!pattern)
        pattern = '/torrents?perPage=100&name={}'

      const path = pattern.replace('{}', keywords.replaceAll('.', ' '))
      const torrents = await this.parsePagination(path, this.parseTorrentPage, 1, expectTorrents)
      return torrents
    }
    catch (error) {
      console.error(`${this.name}: search`, error)
      if (error instanceof Error && error.message.includes('timeout'))
        return ESiteStatus.timeout

      return ESiteStatus.searchFailed
    }
  }

  protected parseTorrentCatagory = (query: JQuery<HTMLElement>): ETorrentCatagory => {
    const map = new Map()
    map.set('1', ETorrentCatagory.application)
    map.set('2', ETorrentCatagory.games)
    map.set('3', ETorrentCatagory.movies)
    map.set('4', ETorrentCatagory.music)
    map.set('5', ETorrentCatagory.animation)
    map.set('6', ETorrentCatagory.xxx)
    map.set('7', ETorrentCatagory.sports)
    map.set('8', ETorrentCatagory.movies)
    map.set('3205', ETorrentCatagory.tv)
    map.set('3206', ETorrentCatagory.tv)
    map.set('3207', ETorrentCatagory.movies)
    map.set('3208', ETorrentCatagory.ebook)
    map.set('3209', ETorrentCatagory.tv)
    const cKey = this.parseTorrentCatagoryKey(query)
    const catagory = cKey ? map.get(cKey) : undefined
    return catagory || ETorrentCatagory.other
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected parseTorrentPromotion = (query: JQuery<HTMLElement>): TorrentPromotion | undefined => {
    return undefined
  }
}

const torrentseeds = new TS({
  name: 'TorrentSeeds',
  url: 'https://torrentseeds.org/',
})

export default torrentseeds
