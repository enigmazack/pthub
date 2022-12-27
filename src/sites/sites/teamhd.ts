import Site from '../model/site'
import { ESiteStatus, ETorrentCatagory, ETorrentPromotion } from '../enum'
import type { SeedingInfo, SeedingTorrentInfo, TorrentInfo, TorrentPromotion, UserInfo } from '../types'
import { parseSize } from '../utils'

class THD extends Site {
  private userUrl = ''

  private async getUserUrl() {
    if (!this.userUrl) {
      const query = await this.getAsQuery('')
      const userUrl = query.find('a[href*="/user/id"]').first().attr('href')
      this.userUrl = userUrl || ''
    }
  }

  async checkStatus(): Promise<ESiteStatus> {
    try {
      let isLogin = false
      const r = await this.get('')
      if (r.request && r.request.responseURL)
        isLogin = !r.request.responseURL.includes('login.php')

      return isLogin ? ESiteStatus.login : ESiteStatus.logout
    }
    catch (error) {
      if (error instanceof Error && error.message.includes('timeout'))
        return ESiteStatus.timeout

      return ESiteStatus.error
    }
  }

  async getUserInfo(): Promise<UserInfo | ESiteStatus> {
    try {
      await this.getUserUrl()
      if (!this.userUrl)
        return ESiteStatus.getUserDataFailed

      const idMatch = this.userUrl.match(/\/user\/id(\d+)/)
      const id = idMatch ? idMatch[1] : ''
      const query = await this.getAsQuery(this.userUrl)
      const name = query.find('a[href*="/user/id"]').first().text()
      const joinDate = this.parseJoinDate(query)
      const uploadString = query.find('#profile_left > table > tbody > tr > td:nth-child(2) > p:nth-child(3)')
        .text().split(':')[1].trim()
      const upload = parseSize(uploadString)
      const downloadString = query.find('#profile_left > table > tbody > tr > td:nth-child(2) > p:nth-child(2)')
        .text().split(':')[1].trim()
      const download = parseSize(downloadString)
      const userClass = query.find('#profile_left > table > tbody > tr > td:nth-child(2) > p:nth-child(1)').text()
      const bonusString = query.find('a[href="/mybonus.php"]').last().text().replaceAll(' ', '')
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

      console.error(error)
      return ESiteStatus.getUserDataFailed
    }
  }

  private parseJoinDate(query: JQuery<Document>): number {
    const dateString = query.find('#profile_right > table.inlay > tbody > tr:nth-child(1) > td:nth-child(2)')
      .text().split('(')[0].trim()
      .replace('января', 'January')
      .replace('февраля', 'February')
      .replace('марта', 'March')
      .replace('апреля', 'April')
      .replace('мая', 'May')
      .replace('июня', 'June')
      .replace('июля', 'July')
      .replace('августа', 'August')
      .replace('сентября', 'September')
      .replace('октября', 'October')
      .replace('ноября', 'November')
      .replace('декабря', 'December')
    return Date.parse(dateString)
  }

  private async getSeedingInfo(): Promise<SeedingInfo> {
    const seedingTorrents = await this.parsePagination(
      '/bprate.php', this.parseSeedingInfoPage, 0,
    )
    const seeding = seedingTorrents.length
    let seedingSize = 0
    seedingTorrents.forEach((t) => { seedingSize += t.size })
    const seedingList = seedingTorrents.map(t => t.id)
    return { seeding, seedingSize, seedingList }
  }

  private parseSeedingInfoPage = (query: JQuery<Document>): SeedingTorrentInfo[] => {
    const seedingTorrents: SeedingTorrentInfo[] = []
    const rows = query.find('table.table').last().find('> tbody > tr')
    for (let i = 0; i < rows.length; i++) {
      const row = rows.eq(i)
      const idString = row.find('a[href*="/details/id"]').attr('href')
      const idMatch = idString ? idString.match(/\/details\/id(\d+)/) : undefined
      const id = idMatch ? idMatch[1] : undefined
      const size = parseSize(row.find('> td').eq(1).text().trim())
      if (id)
        seedingTorrents.push({ id, size })
    }
    return seedingTorrents
  }

  async search(keywords: string, expectTorrents: number, pattern?: string): Promise<TorrentInfo[] | ESiteStatus> {
    try {
      if (!pattern)
        pattern = '/browse?search={}'

      const path = pattern.replace('{}', keywords.replaceAll('.', ' '))
      const torrents = await this.parsePagination(path, this.parseTorrentPage, 0, expectTorrents)
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
    const rows = query.find('table.browse > tbody > tr')
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

  protected parseTorrentCatagoryKey = (query: JQuery<HTMLElement>): string | undefined => {
    const catString = query.find('a[href*="/browse/cat"]').attr('href')
    const catMatch = catString ? catString.match(/cat(\d)+/) : undefined
    const catKey = catMatch ? catMatch[1] : ''
    return catKey
  }

  protected parseTorrentCatagory = (query: JQuery<HTMLElement>): ETorrentCatagory => {
    const map = new Map()
    map.set('29', ETorrentCatagory.movies)
    map.set('25', ETorrentCatagory.animation)
    map.set('26', ETorrentCatagory.music)
    map.set('27', ETorrentCatagory.music)
    map.set('28', ETorrentCatagory.documentary)
    map.set('30', ETorrentCatagory.mv)
    map.set('31', ETorrentCatagory.sports)
    map.set('32', ETorrentCatagory.tv)
    map.set('33', ETorrentCatagory.tv)
    map.set('34', ETorrentCatagory.other)
    map.set('35', ETorrentCatagory.other)
    const cKey = this.parseTorrentCatagoryKey(query)
    const catagory = cKey ? map.get(cKey) : undefined
    return catagory || ETorrentCatagory.other
  }

  protected parseTorrentSeeding = (query: JQuery<HTMLElement>): boolean | undefined => {
    return !!query.find('div.seeder').length
  }

  protected parseTorrentPromotion = (query: JQuery<HTMLElement>): TorrentPromotion | undefined => {
    const proString = query.find('a[href*="/details/id"]').first().attr('style')
    return proString === 'color:#f2b101'
      ? { status: ETorrentPromotion.free, isTemporary: false }
      : undefined
  }

  protected parseTorrentId = (query: JQuery<HTMLElement>): string => {
    const idString = query.find('a[href*="/details/id"]').first().attr('href')
    const idMatch = idString ? idString.match(/id(\d+)/) : undefined
    const id = idMatch ? idMatch[1] : ''
    return id
  }

  protected parseTorrentTitle = (query: JQuery<HTMLElement>): string => {
    return query.find('a[href*="/details/id"]').first().attr('title') || ''
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected parseTorrentSubTitle = (query: JQuery<HTMLElement>): string | undefined => {
    return ''
  }

  protected parseTorrentReleaseDate = (query: JQuery<HTMLElement>): number => {
    const dateString = query.find('div.float-left > small').text()
    return Date.parse(dateString)
  }

  protected parseTorrentSize = (query: JQuery<HTMLElement>): number => {
    const sizeString = query.find('> td').last().contents()
      .filter((index, content) => content.nodeType === 3).text().trim()
    return parseSize(sizeString)
  }

  protected parseTorrentSeeders = (query: JQuery<HTMLElement>): number => {
    const seedersString = query.find('> td').eq(3).text().replaceAll('\n', '')
      .split('|')[0].trim()
    return parseInt(seedersString)
  }

  protected parseTorrentLeechers = (query: JQuery<HTMLElement>): number => {
    const LeechersString = query.find('> td').eq(3).text().replaceAll('\n', '')
      .split('|')[1].trim()
    return parseInt(LeechersString)
  }

  protected parseTorrentSnatched = (query: JQuery<HTMLElement>): number => {
    const snatchedString = query.find('> td').last().find('> strong').text()
      .split(' ')[0]
    return parseInt(snatchedString)
  }

  protected parseTorrentDetailsUrl = (query: JQuery<HTMLElement>): string => {
    return this.url.origin + query.find('a[href*="/details/id"]').first().attr('href') || ''
  }

  protected parseTorrentDownloadUrl = (query: JQuery<HTMLElement>): string => {
    return `${this.url.origin}/${query.find('a[href*="download.php?id="]').first().attr('href')}` || ''
  }
}

const teamhd = new THD({
  name: 'TeamHD',
  url: 'https://teamhd.org/',
})

export default teamhd
