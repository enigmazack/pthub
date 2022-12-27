import { ESiteStatus, ETorrentCatagory, ETorrentPromotion } from '../enum'
import GazelleSite from '../model/gazelleSite'
import type { SeedingInfo, SeedingTorrentInfo, TorrentInfo } from '../types'
import { parseSize } from '../utils'

interface PTPTorrents {
  Checked: boolean
  Codec: string
  Container: string
  FreeleechType?: string
  GoldenPopcorn: boolean
  Id: number
  Leechers: string
  Quality: string
  ReleaseGroup: string | null
  ReleaseName: string
  Resolution: string
  Scene: false
  Seeders: string
  Size: string
  Snatched: string
  Source: string
  UploadTime: string
}

interface PTPMovies {
  Cover: string
  Directors: { Name: string; Id: string }[]
  GroupId: string
  ImdbId: string
  LastUploadTime: string
  MaxSize: number
  Tags: string[]
  Title: string
  Torrents: PTPTorrents[]
  TotalLeechers: number
  TotalSeeders: number
  TotalSnatched: number
  Year: string
}

interface PTPSearchData {
  TotalResults: string
  Movies: PTPMovies[]
  Page: string
  AuthKey: string
  PassKey: string
}

class PTP extends GazelleSite {
  protected async getSeedingInfo(): Promise<SeedingInfo> {
    const seedingTorrents = await this.parsePagination(
      '/bprate.php', this.parseSeedingInfoPage, 1,
    )
    const seeding = seedingTorrents.length
    let seedingSize = 0
    seedingTorrents.forEach((t) => { seedingSize += t.size })
    const seedingList = seedingTorrents.map(t => t.id)
    return { seeding, seedingSize, seedingList }
  }

  private parseSeedingInfoPage = (query: JQuery<Document>): SeedingTorrentInfo[] => {
    const seedingTorrents: SeedingTorrentInfo[] = []
    const rows = query.find('table').last().find('> tbody > tr')
    for (let i = 0; i < rows.length; i++) {
      const row = rows.eq(i)
      const idString = row.find('a[href*="torrents.php?id="]').attr('href')
      const idMatch = idString ? idString.match(/torrentid=(\d+)/) : undefined
      const id = idMatch ? idMatch[1] : undefined
      const size = parseSize(row.find('> td').eq(2).text().trim())
      if (id)
        seedingTorrents.push({ id, size })
    }
    return seedingTorrents
  }

  async search(keywords: string, expectTorrents: number, pattern?: string): Promise<TorrentInfo[] | ESiteStatus> {
    try {
      const url = new URL(this.url.href)
      if (pattern) {
        const [pathname, search] = pattern.split('?')
        url.pathname = pathname
        url.search = search.replace('{}', keywords.replaceAll('.', ' '))
      }
      else {
        url.pathname = '/torrents.php'
        url.searchParams.set('searchstr', keywords.replaceAll('.', ' '))
      }
      url.searchParams.set('json', 'noredirect')
      url.searchParams.set('grouping', '0')
      let rSearch = await this.get(url.pathname + url.search)
      let searchData = rSearch.data as PTPSearchData
      if (searchData.TotalResults === '0') {
        url.searchParams.delete('searchstr')
        url.searchParams.set('filelist', keywords.replaceAll('.', ' '))
        rSearch = await this.get(url.pathname + url.search)
        searchData = rSearch.data as PTPSearchData
      }
      const maxPage = Math.ceil(parseInt(searchData.TotalResults) / 50)
      let currentPage = 1
      let torrents = this.parseSearchData(searchData)
      while (currentPage < maxPage && torrents.length < expectTorrents) {
        currentPage += 1
        url.searchParams.set('page', currentPage.toString())
        const r = await this.get(url.pathname + url.search)
        const moreTorrents = this.parseSearchData(r.data)
        torrents = torrents.concat(moreTorrents)
      }
      return torrents
    }
    catch (error) {
      console.error(`${this.name}: search`, error)
      if (error instanceof Error && error.message.includes('timeout'))
        return ESiteStatus.timeout

      return ESiteStatus.searchFailed
    }
  }

  private parseSearchData(searchData: PTPSearchData): TorrentInfo[] {
    const movies = searchData.Movies
    const authKey = searchData.AuthKey
    const passKey = searchData.PassKey
    return movies.map<TorrentInfo>((movie) => {
      const groupId = movie.GroupId
      const torrent = movie.Torrents[0]
      const id = torrent.Id.toString()
      const dlUrl = new URL(this.url.href)
      dlUrl.pathname = '/torrents.php'
      dlUrl.searchParams.set('action', 'download')
      dlUrl.searchParams.set('id', id)
      dlUrl.searchParams.set('authkey', authKey)
      dlUrl.searchParams.set('passKey', passKey)
      const detailUrl = new URL(this.url.href)
      detailUrl.pathname = '/torrents.php'
      detailUrl.searchParams.set('id', groupId)
      detailUrl.searchParams.set('torrentid', id)
      const title = `${movie.Title} [${movie.Year}] ${torrent.Codec} / ${torrent.Container} / ${torrent.Source} / ${torrent.Resolution}`
      return {
        id,
        downloadUrl: dlUrl.href,
        detailUrl: detailUrl.href,
        title,
        releaseDate: Date.parse(torrent.UploadTime),
        subTitle: torrent.ReleaseName,
        catagory: ETorrentCatagory.movies,
        size: parseInt(torrent.Size),
        seeders: parseInt(torrent.Seeders),
        leechers: parseInt(torrent.Leechers),
        snatched: parseInt(torrent.Snatched),
        promotion: torrent.FreeleechType
          ? { status: ETorrentPromotion.free, isTemporary: true }
          : undefined,
      }
    })
  }
}

const passthepopcorn = new PTP({
  name: 'PTP',
  url: 'https://passthepopcorn.me/',
})

export default passthepopcorn
