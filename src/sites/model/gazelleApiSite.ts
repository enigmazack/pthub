import $ from 'jquery'
import { ESiteStatus, ETorrentCatagory, ETorrentPromotion } from '../enum'
import type { SeedingInfo, TorrentInfo, TorrentPromotion, UserInfo } from '../types'
import Site from './site'

export interface GResponseData<T> {
  status: string
  response: T
}

interface GNotifications {
  messages: number
  notifications: number
  newAnnouncement: boolean
  newBlog: boolean
  newSubscriptions: boolean
}

interface GIndexStats {
  uploaded: number
  downloaded: number
  ratio: number
  requiredratio: number
  class: string
  bonusPoints?: number
}

export interface GIndex {

  api_version?: string
  authkey: string
  id: number
  notifications: GNotifications
  passkey: string
  username: string
  userstats: GIndexStats
}

interface GUserStats {
  downloaded: number
  joinedDate: string
  lastAccess: string
  ratio: number
  requiredRatio: number
  uploaded: number
}

interface GUser {
  avatar: string
  community: any
  isFriend: boolean
  personal: any
  profileText: string
  ranks: any
  stats: GUserStats
  username: string
}

export interface GTorrent {
  artists: { id: number; name: string; aliasid: number }[]
  canUseToken?: boolean
  editionId: number
  encoding: string
  fileCount: number
  format: string
  hasCue: boolean
  hasLog: boolean
  hasSnatched: boolean
  isFreeleech: boolean
  isNeutralLeech: boolean
  isPersonalFreeleech: boolean
  leechers: number
  logScore: number
  media: string
  remasterCatalogueNumber: string
  remasterTitle: string
  remasterYear: number
  remastered: boolean
  scene: boolean
  seeders: number
  size: number
  snatches: number
  time: string
  torrentId: number
  vanityHouse?: boolean
  codec?: string
  source?: string
  resolution?: string
  container?: string
  processing?: string
  fileName?: string
  releaseGroup?: string
}

export interface GGroup {
  artist: string
  bookmarked: boolean
  cover: string
  groupId: number
  groupName: string
  groupSubName?: string
  groupTime: string
  groupYear: number
  maxSize: number
  releaseType: string
  tags: string[]
  torrents?: GTorrent[]
  totalLeechers: number
  totalSeeders: number
  totalSnatched: number
  vanityHouse?: boolean
  torrentId?: number
  size?: number
  seeders?: number
  leechers?: number
  snatches?: number
  isFreeleech?: boolean
  isNeutralLeech?: boolean
  isPersonalFreeleech?: boolean
  category?: string
}

interface GBrowse {
  currentPage: number
  pages: number
  results: GGroup[]
}

export default class GazelleApiSite extends Site {
  protected passKey = ''
  protected authKey = ''
  protected userId = ''

  protected parseHTML(page: string): JQuery<Document> {
    // ignore the head
    page = page.replace(/<head>[\s\S]*<\/head>/, '')
    const document = new DOMParser().parseFromString(page, 'text/html')
    const j = $(document)
    return j
  }

  async checkStatus(): Promise<ESiteStatus> {
    try {
      let isLogin = false
      const r = await this.get('/index.php')
      if (r.request && r.request.responseURL)
        isLogin = r.request.responseURL.match(/index\.php/)

      return isLogin ? ESiteStatus.login : ESiteStatus.logout
    }
    catch (error) {
      if (error instanceof Error && error.message.includes('timeout'))
        return ESiteStatus.timeout

      return ESiteStatus.error
    }
  }

  protected async getKeys(): Promise<void> {
    if (!this.passKey || !this.authKey) {
      const r = await this.get('/ajax.php?action=index')
      const rData = r.data as GResponseData<GIndex>
      const rIndex = rData.response
      this.passKey = rIndex.passkey
      this.authKey = rIndex.authkey
    }
  }

  async getUserInfo(): Promise<UserInfo | ESiteStatus> {
    try {
      const r = await this.get('/ajax.php?action=index')
      const rData = r.data as GResponseData<GIndex>
      const rIndex = rData.response
      const id = rIndex.id.toString()
      this.userId = id
      const rU = await this.get(`/ajax.php?action=user&id=${id}`)
      const rUserData = rU.data as GResponseData<GUser>
      const rUser = rUserData.response
      const joinDate = Date.parse(rUser.stats.joinedDate)
      const name = rIndex.username
      const upload = rIndex.userstats.uploaded
      const download = rIndex.userstats.downloaded
      const userClass = rIndex.userstats.class
      const bonus = await this.getBonus(rIndex)
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

  protected async getSeedingInfo(): Promise<SeedingInfo> {
    return {
      seeding: 0,
      seedingSize: 0,
      seedingList: [],
    }
  }

  protected async getBonus(_rIndex: GIndex): Promise<number> {
    return -1
  }

  async search(keywords: string, expectTorrents: number, pattern?: string): Promise<TorrentInfo[] | ESiteStatus> {
    try {
      await this.getKeys()
      const url = new URL(this.url.href)
      if (pattern) {
        const [pathname, search] = pattern.split('?')
        url.pathname = pathname
        url.search = search.replace('{}', keywords.replaceAll('.', ' '))
      }
      else {
        url.pathname = 'ajax.php'
        url.searchParams.set('searchstr', keywords.replaceAll('.', ' '))
      }
      url.searchParams.set('action', 'browse')
      const r = await this.get(url.pathname + url.search)
      const rData = r.data as GResponseData<GBrowse>
      const rSearch = rData.response
      const rGroups = rSearch.results
      const maxPage = rSearch.pages
      let currentPage = 1
      let torrents = this.parseTorrentPage(rGroups)
      while (currentPage < maxPage && torrents.length < expectTorrents) {
        currentPage += 1
        url.searchParams.set('page', currentPage.toString())
        const rPage = await this.get(url.pathname + url.search)
        const rPageData = rPage.data as GResponseData<GBrowse>
        const moreTorrents = this.parseTorrentPage(rPageData.response.results)
        torrents = torrents.concat(moreTorrents)
      }
      return torrents
    }
    catch (error) {
      console.error(`${this.name}: search`, error)
      if (error instanceof Error && error.message.includes('timeout'))
        return ESiteStatus.timeout

      console.error(error)
      return ESiteStatus.searchFailed
    }
  }

  protected parseTorrentPage(rGroups: GGroup[]): TorrentInfo[] {
    const torrents: TorrentInfo[] = []
    rGroups.forEach((group) => {
      group.torrents?.forEach((torrent) => {
        const id = torrent.torrentId.toString()
        const dlUrl = new URL(this.url.href)
        dlUrl.pathname = '/torrents.php'
        dlUrl.searchParams.set('action', 'download')
        dlUrl.searchParams.set('id', id)
        dlUrl.searchParams.set('authkey', this.authKey)
        dlUrl.searchParams.set('torrent_pass', this.passKey)
        const detailUrl = new URL(this.url.href)
        detailUrl.pathname = '/torrents.php'
        detailUrl.searchParams.set('id', group.groupId.toString())
        detailUrl.searchParams.set('torrentid', id)
        torrents.push({
          id,
          downloadUrl: dlUrl.href,
          detailUrl: detailUrl.href,
          title: this.parseTorrentTitle(group, torrent),
          releaseDate: this.parseTorrentReleaseDate(group, torrent),
          subTitle: this.parseTorrentSubTitle(group, torrent),
          catagory: this.parseTorrentCatagory(group, torrent),
          size: torrent.size,
          seeders: torrent.seeders,
          leechers: torrent.leechers,
          snatched: torrent.snatches,
          promotion: this.parseTorrentPromotion(group, torrent),
        })
      })
      if (!group.torrents) {
        const id = group.torrentId?.toString() || ''
        const dlUrl = new URL(this.url.href)
        dlUrl.pathname = '/torrents.php'
        dlUrl.searchParams.set('action', 'download')
        dlUrl.searchParams.set('id', id)
        dlUrl.searchParams.set('authkey', this.authKey)
        dlUrl.searchParams.set('torrent_pass', this.passKey)
        const detailUrl = new URL(this.url.href)
        detailUrl.pathname = '/torrents.php'
        detailUrl.searchParams.set('id', group.groupId.toString())
        detailUrl.searchParams.set('torrentid', id)
        torrents.push({
          id,
          downloadUrl: dlUrl.href,
          detailUrl: detailUrl.href,
          title: group.groupName,
          releaseDate: this.parseTorrentReleaseDate(group),
          subTitle: this.parseTorrentSubTitle(group),
          catagory: this.parseTorrentCatagory(group),
          size: group.size || 0,
          seeders: group.seeders || 0,
          leechers: group.leechers || 0,
          snatched: group.snatches || 0,
          promotion: this.parseTorrentPromotion(group),
        })
      }
    })
    return torrents
  }

  protected parseTorrentTitle(group: GGroup, _torrent: GTorrent): string {
    return `${group.artist} - ${group.groupName} [${group.groupYear}] [${group.releaseType}]`
  }

  protected parseTorrentSubTitle(_group: GGroup, torrent?: GTorrent): string | undefined {
    if (torrent) {
      let subTitle = `${torrent.format} / ${torrent.encoding} / ${torrent.media}`
      subTitle += torrent.hasLog ? ` / Log(${torrent.logScore}%)` : ''
      subTitle += torrent.hasCue ? ' / Cue' : ''
      subTitle += torrent.scene ? ' / Scene' : ''
      return subTitle
    }
    return undefined
  }

  protected parseTorrentReleaseDate(group: GGroup, torrent?: GTorrent): number {
    return torrent ? Date.parse(torrent.time) : parseInt(group.groupTime) * 1000
  }

  protected parseTorrentCatagory(_group: GGroup, torrent?: GTorrent): ETorrentCatagory {
    if (torrent)
      return ETorrentCatagory.music

    return ETorrentCatagory.other
  }

  protected parseTorrentPromotion(group: GGroup, torrent?: GTorrent): TorrentPromotion | undefined {
    if (torrent) {
      return torrent.isFreeleech || torrent.isNeutralLeech || torrent.isPersonalFreeleech
        ? { status: ETorrentPromotion.free, isTemporary: false }
        : undefined
    }
    return group.isFreeleech || group.isNeutralLeech || group.isPersonalFreeleech
      ? { status: ETorrentPromotion.free, isTemporary: false }
      : undefined
  }
}
