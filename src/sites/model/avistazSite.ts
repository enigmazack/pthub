import { ESiteStatus, ETorrentCatagory, ETorrentPromotion } from '../enum'
import type { SeedingInfo, SeedingTorrentInfo, TorrentInfo, TorrentPromotion, UserInfo } from '../types'
import { parseSize } from '../utils'
import Site from './site'

export default class AvistaZSite extends Site {
  protected userName = ''
  async checkStatus(): Promise<ESiteStatus> {
    try {
      const query = await this.getAsQuery('')
      const isLogin = !query.find('a[href*="/auth/login"]').length
      return isLogin ? ESiteStatus.login : ESiteStatus.logout
    }
    catch (error) {
      if (error instanceof Error && error.message.includes('timeout'))
        return ESiteStatus.timeout

      return ESiteStatus.error
    }
  }

  protected async getUserName(): Promise<void> {
    if (!this.userName) {
      const query = await this.getAsQuery('')
      const nameString = query.find('a[href*="/profile"]').first().attr('href')
      const nameMatch = nameString ? nameString.match(/profile\/(.+)/) : undefined
      const id = nameMatch ? nameMatch[1] : ''
      this.userName = id
    }
  }

  async getUserInfo(): Promise<UserInfo | ESiteStatus> {
    try {
      await this.getUserName()
      if (!this.name)
        return ESiteStatus.getUserIdFailed

      const query = await this.getAsQuery(`/profile/${this.userName}`)
      const id = query.find('td:contains("User ID")').next().text().trim()
      const name = this.userName
      const joinDateString = query.find('td:contains("Joined")').next().text().split('\n')[0]
      const joinDate = Date.parse(joinDateString)
      const uploadString = query.find('td:contains("Uploaded")').next().text().split('\n')[0]
      const upload = parseSize(uploadString)
      const downloadString = query.find('td:contains("Downloaded")').next().text().split('\n')[0]
      const download = parseSize(downloadString)
      const userClass = query.find('td:contains("Rank")').next().text().trim()
      const bonusString = query.find('td:contains("Bonus Points")').next().text().trim()
      const bonus = parseFloat(bonusString)
      const seedingInfo = await this.getSeedingInfo()
      return {
        name,
        id,
        joinDate,
        upload,
        download,
        bonus,
        userClass,
        ...seedingInfo,
      }
    }
    catch (error) {
      console.error(`${this.name}: getUserInfo`, error)
      if (error instanceof Error && error.message.includes('timeout'))
        return ESiteStatus.timeout

      return ESiteStatus.getUserDataFailed
    }
  }

  // Pagination unchecked
  protected async getSeedingInfo(): Promise<SeedingInfo> {
    const seedingTorrents = await this.parsePagination(
      `/profile/${this.userName}/active`, this.parseSeedingInfoPage, 1,
    )
    const seeding = seedingTorrents.length
    let seedingSize = 0
    seedingTorrents.forEach((t) => { seedingSize += t.size })
    const seedingList = seedingTorrents.map(t => t.id)
    return { seeding, seedingSize, seedingList }
  }

  private parseSeedingInfoPage = (query: JQuery<Document>): SeedingTorrentInfo[] => {
    const seedingTorrents: SeedingTorrentInfo[] = []
    const rows = query.find('table.table > tbody > tr')
    for (let i = 0; i < rows.length; i++) {
      const row = rows.eq(i)
      const isSeeding = row.find('> td').eq(3).text().trim() === 'seed'
      if (isSeeding) {
        const idString = row.find('a[href*="/torrent/"]').attr('href')
        const idMatch = idString ? idString.match(/torrent\/(\d+)-/) : undefined
        const id = idMatch ? idMatch[1] : undefined
        const sizeString = row.find('span[title="File Size"]').first().text().trim()
        const size = parseSize(sizeString)
        if (id)
          seedingTorrents.push({ id, size })
      }
    }
    return seedingTorrents
  }

  async search(keywords: string, expectTorrents: number, pattern?: string): Promise<TorrentInfo[] | ESiteStatus> {
    try {
      if (!pattern)
        pattern = '/torrents?in=1&search={}'

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

  protected parseTorrentPage = (query: JQuery<Document>): TorrentInfo[] => {
    const torrents: TorrentInfo[] = []
    const rows = query.find('table.table').first().find('> tbody > tr')
    for (let i = 0; i < rows.length; i++) {
      const row = rows.eq(i)
      const catagory = this.parseTorrentCatagory(row)
      const id = this.parseTorrentId(row)
      const detailUrl = this.parseTorrentDetailsUrl(row)
      const downloadUrl = this.parseTorrentDownloadUrl(row)
      const title = this.parseTorrentTitle(row)
      const subTitle = this.parseTorrentSubTitle(row)
      const releaseDate = this.parseTorrentReleaseDate(row)
      const size = this.parseTorrentSize(row)
      const seeders = this.parseTorrentSeeders(row)
      const leechers = this.parseTorrentLeechers(row)
      const snatched = this.parseTorrentSnatched(row)
      const seeding = this.parseTorrentSeeding(row)
      const promotion = this.parseTorrentPromotion(row)
      const data = {
        id,
        title,
        subTitle,
        detailUrl,
        downloadUrl,
        size,
        seeders,
        leechers,
        snatched,
        releaseDate,
        catagory,
        seeding,
        promotion,
      }
      torrents.push(data)
    }
    return torrents
  }

  protected parseTorrentCatagory = (query: JQuery<HTMLElement>): ETorrentCatagory => {
    const catString = query.find('i').first().attr('title')
    if (catString === 'TV-Show Torrent')
      return ETorrentCatagory.tv

    if (catString === 'Movie Torrent')
      return ETorrentCatagory.movies

    if (catString === 'Music Torrent')
      return ETorrentCatagory.music

    return ETorrentCatagory.other
  }

  protected parseTorrentSeeding = (query: JQuery<HTMLElement>): boolean | undefined => {
    return query.attr('class') === 'success'
  }

  protected parseTorrentPromotion = (query: JQuery<HTMLElement>): TorrentPromotion | undefined => {
    let status: ETorrentPromotion | undefined
    if (query.find('i[title*="Half"]').length)
      status = ETorrentPromotion.half

    if (query.find('i[title*="Free"]').length)
      status = ETorrentPromotion.free

    return status ? { status, isTemporary: false } : undefined
  }

  protected parseTorrentId = (query: JQuery<HTMLElement>): string => {
    const idString = query.find('a[href*="/torrent/"]').attr('href')
    const idMatch = idString ? idString.match(/torrent\/(\d+)-/) : undefined
    const id = idMatch ? idMatch[1] : ''
    return id
  }

  protected parseTorrentTitle = (query: JQuery<HTMLElement>): string => {
    return query.find('a[href*="/torrent/"]').text().trim()
  }

  protected parseTorrentSubTitle = (query: JQuery<HTMLElement>): string | undefined => {
    const spans = query.find('> td:eq(1) span.badge-extra')
    const textList: string[] = []
    for (let i = 0; i < spans.length; i++)
      textList.push(spans.eq(i).text().trim().replaceAll('\n', ''))

    const subTitle = textList.join(' / ')
    return subTitle
  }

  protected parseTorrentReleaseDate = (query: JQuery<HTMLElement>): number => {
    const dateString = query.find('> td').eq(3).find('> span').attr('title') || ''
    return Date.parse(dateString)
  }

  protected parseTorrentSize = (query: JQuery<HTMLElement>): number => {
    const sizeString = query.find('> td').eq(5).text().trim()
    return parseSize(sizeString)
  }

  protected parseTorrentSeeders = (query: JQuery<HTMLElement>): number => {
    const seedersString = query.find('> td').eq(6).text().trim()
    return parseInt(seedersString)
  }

  protected parseTorrentLeechers = (query: JQuery<HTMLElement>): number => {
    const leechersString = query.find('> td').eq(7).text().trim()
    return parseInt(leechersString)
  }

  protected parseTorrentSnatched = (query: JQuery<HTMLElement>): number => {
    const snatchedString = query.find('> td').eq(8).text().trim()
    return parseInt(snatchedString)
  }

  protected parseTorrentDetailsUrl = (query: JQuery<HTMLElement>): string => {
    return query.find('a[href*="/torrent/"]').attr('href') || ''
  }

  protected parseTorrentDownloadUrl = (query: JQuery<HTMLElement>): string => {
    return query.find('a[href*="/download/torrent/"]').attr('href') || ''
  }
}
