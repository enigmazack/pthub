import { ESiteStatus, ETorrentCatagory, ETorrentPromotion } from '../enum'
import NexusPHPSite from '../model/nexusPHPSite'
import {
  SeedingInfo, TorrentInfo
} from '../types'
import { parseSize } from '../utils'

interface PTPTorrents {
  Checked: boolean,
  Codec: string,
  Container: string,
  FreeleechType?: string
  GoldenPopcorn: boolean,
  Id: number,
  Leechers: string,
  Quality: string,
  ReleaseGroup: string | null,
  ReleaseName: string,
  Resolution: string,
  Scene: false
  Seeders: string,
  Size: string,
  Snatched: string,
  Source: string
  UploadTime: string
}

interface PTPMovies {
  Cover: string,
  Directors: {Name: string, Id: string}[],
  GroupId: string,
  ImdbId: string,
  LastUploadTime: string,
  MaxSize: number,
  Tags: string[],
  Title: string,
  Torrents: PTPTorrents[],
  TotalLeechers: number,
  TotalSeeders: number,
  TotalSnatched: number,
  Year: string
}

interface PTPSearchData {
  TotalResults: string,
  Movies: PTPMovies[],
  Page: string,
  AuthKey: string,
  PassKey: string
}

class PTP extends NexusPHPSite {
  protected userPath = '/user.php'
  protected userPathRegex = /user\.php\?id=(\d+)/

  protected parseUserName (query: JQuery<Document>): string {
    const name = query.find('a[href*="user.php?id="]').first().text()
    return name
  }

  protected parseJoinDate (query: JQuery<Document>): number {
    const joinDateString = query.find('li:contains("Joined")').find('> span').attr('title')
    const joinDate = joinDateString ? Date.parse(joinDateString) : 0
    return joinDate
  }

  protected parseUserClass (query: JQuery<Document>): string {
    const userClass = query.find('li:contains("Class")').text().split(':')[1].trim() || ''
    return userClass
  }

  protected parseBonus (query: JQuery<Document>): number {
    const bonusString = query.find('li:contains("Points")')
      .text().split(':')[1].trim().replaceAll(',', '')
    const bonus = parseFloat(bonusString)
    return bonus
  }

  protected parseUpload (query: JQuery<Document>): number {
    const uploadString = query.find('li:contains("Uploaded:")')
      .first().text().split(':')[1].trim()
    const upload = parseSize(uploadString)
    return upload
  }

  protected parseDownload (query: JQuery<Document>): number {
    const downloadString = query.find('li:contains("Downloaded:")')
      .first().text().split(':')[1].trim()
    const download = parseSize(downloadString)
    return download
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async getSeedingInfo (id: string): Promise<SeedingInfo> {
    const url = new URL(this.url.href)
    url.pathname = '/bprate.php'
    const rSeeding = await this.get(url.pathname)
    const query = this.parseHTML(rSeeding.data)
    let seeding = 0
    let seedingSize = 0
    let seedingList: string[] = []
    let currentPage = this.parseSeedingInfoPage(query)
    seeding += currentPage.seeding
    seedingSize += currentPage.seedingSize
    if (currentPage.seedingList) {
      seedingList = seedingList.concat(currentPage.seedingList)
    }
    const pageString = query.find('a[href*="bprate.php"]').last().attr('href')
    const pageMatch = pageString ? pageString.match(/page=(\d+)/) : undefined
    const maxPage = pageMatch ? parseInt(pageMatch[1]) : 0
    if (maxPage) {
      for (let i = 2; i <= maxPage; i++) {
        url.searchParams.set('page', i.toString())
        const rPage = await this.get(url.pathname + url.search)
        const qPage = this.parseHTML(rPage.data)
        currentPage = this.parseSeedingInfoPage(qPage)
        seeding += currentPage.seeding
        seedingSize += currentPage.seedingSize
        if (currentPage.seedingList) {
          seedingList = seedingList.concat(currentPage.seedingList)
        }
      }
    }
    return { seeding, seedingSize, seedingList }
  }

  private parseSeedingInfoPage (query: JQuery<Document>): SeedingInfo {
    let seedingSize = 0
    const seedingList: string[] = []
    const rows = query.find('table').last().find('> tbody > tr')
    for (let i = 0; i < rows.length; i++) {
      const row = rows.eq(i)
      const torrentIdString = row.find('a[href*="torrents.php?id="]').attr('href')
      const torrentIdMatch = torrentIdString ? torrentIdString.match(/torrentid=(\d+)/) : undefined
      const torrentId = torrentIdMatch ? torrentIdMatch[1] : undefined
      if (torrentId) {
        seedingList.push(torrentId)
      }
      const torrentSizeThis = parseSize(row.find('> td').eq(2).text().trim())
      seedingSize += torrentSizeThis
    }
    const seeding = seedingList.length
    return { seeding, seedingSize, seedingList }
  }

  async search (keywords: string, expectTorrents: number, pattern?: string): Promise<TorrentInfo[]|ESiteStatus> {
    try {
      const url = new URL(this.url.href)
      if (pattern) {
        const [pathname, search] = pattern.split('?')
        url.pathname = pathname
        url.search = search.replace('{}', keywords.replaceAll('.', ' '))
      } else {
        url.pathname = this.torrentPath
        url.searchParams.set('searchstr', keywords.replaceAll('.', ' '))
      }
      url.searchParams.set('json', 'noredirect')
      url.searchParams.set('grouping', '0')
      const rSearch = await this.get(url.pathname + url.search)
      const searchData = rSearch.data as PTPSearchData
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
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        return ESiteStatus.timeout
      }
      return ESiteStatus.searchFailed
    }
  }

  private parseSearchData (searchData: PTPSearchData): TorrentInfo[] {
    const movies = searchData.Movies
    const authKey = searchData.AuthKey
    const passKey = searchData.PassKey
    return movies.map<TorrentInfo>(movie => {
      const groupId = movie.GroupId
      const torrent = movie.Torrents[0]
      const id = torrent.Id.toString()
      const dlUrl = new URL(this.url.href)
      dlUrl.pathname = this.torrentPath
      dlUrl.searchParams.set('action', 'download')
      dlUrl.searchParams.set('id', id)
      dlUrl.searchParams.set('authkey', authKey)
      dlUrl.searchParams.set('passKey', passKey)
      const detailUrl = new URL(this.url.href)
      detailUrl.pathname = this.torrentPath
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
          : undefined
      }
    })
  }
}

const passthepopcorn = new PTP({
  name: 'PTP',
  url: 'https://passthepopcorn.me/'
})

export default passthepopcorn
