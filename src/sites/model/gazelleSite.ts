import Site from './site'
import {
  ETorrentCatagory,
  ETorrentPromotion,
  ESiteStatus
} from '../enum'
import {
  UserInfo,
  SeedingInfo,
  TorrentInfo,
  TorrentPromotion
} from '../types'
import { parseSize } from '../utils'

export default class GazelleSite extends Site {
  protected userId = ''
  protected passKey = ''
  protected authKey = ''
  async checkStatus (): Promise<ESiteStatus> {
    try {
      let isLogin = false
      const r = await this.get('/index.php')
      if (r.request && r.request.responseURL) {
        isLogin = r.request.responseURL.match(/index\.php/)
      }
      return isLogin ? ESiteStatus.login : ESiteStatus.logout
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        return ESiteStatus.timeout
      }
      return ESiteStatus.error
    }
  }

  protected async getUserId (): Promise<void> {
    if (!this.userId) {
      const r = await this.get('/index.php')
      const idMatch = r.data.match(/user.php\?id=(\d+)/)
      const id = idMatch ? idMatch[1] : ''
      this.userId = id
    }
  }

  async getUserInfo (): Promise<UserInfo|ESiteStatus> {
    try {
      await this.getUserId()
      if (!this.userId) {
        return ESiteStatus.getUserIdFailed
      }
      const url = new URL(this.url.href)
      url.pathname = '/user.php'
      url.searchParams.set('id', this.userId)
      const query = await this.getAsQuery(url.pathname + url.search)
      const name = this.parseUserName(query)
      const joinDate = this.parseJoinDate(query)
      const upload = this.parseUpload(query)
      const download = this.parseDownload(query)
      const userClass = this.parseUserClass(query)
      const bonus = this.parseBonus(query)
      const seedingInfo = await this.getSeedingInfo()
      return {
        name,
        id: this.userId,
        joinDate,
        upload,
        download,
        bonus,
        userClass,
        ...seedingInfo
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        return ESiteStatus.timeout
      }
      console.log(error)
      return ESiteStatus.getUserDataFailed
    }
  }

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

  protected parseBonus (query: JQuery<Document>): number {
    const bonusString = query.find('li:contains("Points:")')
      .first().text().split(':')[1].trim().replaceAll(',', '')
    const bonus = parseInt(bonusString)
    return bonus
  }

  protected async getSeedingInfo (): Promise<SeedingInfo> {
    return { seeding: 0, seedingSize: 0, seedingList: [] }
  }

  async search (keywords: string, expectTorrents: number, pattern?: string): Promise<TorrentInfo[]|ESiteStatus> {
    try {
      if (!pattern) {
        pattern = '/torrents.php?grouping=0&searchstr={}'
      }
      const path = pattern.replace('{}', keywords.replaceAll('.', ' '))
      const torrents = this.parsePagination<TorrentInfo>(
        path, this.parseTorrentPage, 1, expectTorrents
      )
      return torrents
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        return ESiteStatus.timeout
      }
      return ESiteStatus.searchFailed
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected parseTorrentPage = (query: JQuery<Document>): TorrentInfo[] => {
    return []
  }
}
