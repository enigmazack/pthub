import axios from 'axios'
import Site from '../model/site'
import { ESiteStatus, ETorrentCatagory, ETorrentPromotion } from '../enum'
import type { SeedingInfo, TorrentInfo, TorrentPromotion, UserInfo } from '../types'
import { parseSize } from '../utils'

interface BHDAPIPOSTData {
  action: string
  search?: string
  info_hash?: string
  folder_name?: string
  file_name?: string
  size?: number
  uploaded_by?: string
  imdb_id?: number
  tmdb_id?: number
  categories?: string
  types?: string
  sources?: string
  genres?: string
  groups?: string
  freeleech?: number
  limited?: number
  promo25?: number
  promo50?: number
  promo75?: number
  refund?: number
  rescue?: number
  rewind?: number
  stream?: number
  sd?: number
  pack?: number
  h264?: number
  h265?: number
  features?: string
  alive?: number
  dying?: number
  dead?: number
  reseed?: number
  seeding?: number
  leeching?: number
  completed?: number
  incomplete?: number
  notdownloaded?: number
  min_bhd?: number
  vote_bhd?: number
  min_imdb?: number
  vote_imdb?: number
  min_tmdb?: number
  vote_tmdb?: number
  min_year?: number
  max_year?: number
  countries?: string
  languages?: string
  audios?: string
  subtitles?: string
  sort?: string
  order?: string
  page?: number
}

interface BHDTorrent {
  bhd_rating: number
  bumped_at: string
  category: string
  created_at: string
  folder_name: string
  freeleech: number
  id: number
  imdb_id: string
  imdb_rating: number
  info_hash: string
  leechers: number
  limited: number
  name: string
  promo25: number
  promo50: number
  promo75: number
  refund: number
  rescue: number
  rewind: number
  seeders: number
  size: number
  times_completed: number
  tmdb_id: string
  tmdb_rating: number
  tv_pack: number
  type: string
  url: string
}

interface BHDResponseData {
  page: number
  results: BHDTorrent[]
  status_code: number
  success: boolean
  total_pages: number
  total_results: number
}

class BHD extends Site {
  private userUrl = ''
  private apiKey = ''

  async checkStatus(): Promise<ESiteStatus> {
    try {
      await this.get('')
      return ESiteStatus.login
    }
    catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401)
          return ESiteStatus.logout

        if (error.message.includes('timeout'))
          return ESiteStatus.timeout
      }
      return ESiteStatus.error
    }
  }

  private async getUserUrl(): Promise<void> {
    if (!this.userUrl) {
      const qIndex = await this.getAsQuery('')
      const userUrl = qIndex.find('div.dropmenu > a').attr('href')
      this.userUrl = userUrl || ''
    }
  }

  private async getAPIKey(): Promise<void> {
    if (!this.apiKey) {
      await this.getUserUrl()
      const query = await this.getAsQuery(`${this.userUrl}/settings/change_api`)
      this.apiKey = query.find('input.beta-form-main').attr('value') || ''
    }
  }

  async getUserInfo(): Promise<UserInfo | ESiteStatus> {
    try {
      await this.getUserUrl()
      if (!this.userUrl)
        return ESiteStatus.getUserDataFailed

      const userMatch = this.userUrl.match(/beyond-hd\.me\/(.+)\.(\d+)/)
      const name = userMatch ? userMatch[1] : ''
      const id = userMatch ? userMatch[2] : ''
      const query = await this.getAsQuery(this.userUrl)
      const joinDateString = query.find('div.button-holder > div > h5:contains("Since")').text()
        .split(':')[1].trim()
      const joinDate = Date.parse(joinDateString)
      const uploadString = query.find('td.bhd-user-left:contains("Upload")').next().find('span').first().text()
      const upload = parseSize(uploadString)
      const downloadString = query.find('td.bhd-user-left:contains("Downloaded")').next().find('span').first().text()
      const download = parseSize(downloadString)
      const userClass = query.find('span.badge-faded').text().trim()
      const bonusString = query.find('td.bhd-user-left:contains("BP")').next().find('li').first()
        .find('> span > span').text().replaceAll(' ', '')
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

  protected async getSeedingInfo(): Promise<SeedingInfo> {
    await this.getAPIKey()
    const path = `/api/torrents/${this.apiKey}`
    let r = await this.post(path, { action: 'search', seeding: 1 })
    let data = r.data as BHDResponseData
    const seeding = data.total_results
    const maxPage = data.total_pages
    let currentPage = 1
    let seedingSize = 0
    const seedingList: string[] = []
    data.results.forEach((t) => {
      seedingSize += t.size
      seedingList.push(t.id.toString())
    })
    while (currentPage < maxPage) {
      currentPage += 1
      r = await this.post(path, { action: 'search', seeding: 1, page: currentPage })
      data = r.data as BHDResponseData
      data.results.forEach((t) => {
        seedingSize += t.size
        seedingList.push(t.id.toString())
      })
    }
    return { seeding, seedingSize, seedingList }
  }

  async search(keywords: string, expectTorrents: number, pattern?: string): Promise<TorrentInfo[] | ESiteStatus> {
    try {
      if (!pattern)
        pattern = '/torrents?search={}&doSearch=Search'

      const urlString = this.url.origin + pattern.replace('{}', keywords.replaceAll('.', ' '))
      const url = new URL(urlString)
      const postData = this.convertURL2POSTData(url)
      await this.getAPIKey()
      const path = `/api/torrents/${this.apiKey}`
      let r = await this.post(path, postData)
      let data = r.data as BHDResponseData
      const maxPage = data.total_pages
      let currentPage = 1
      let results = data.results
      let torrents = this.parseTorrentPage(results)
      while (currentPage < maxPage && torrents.length < expectTorrents) {
        currentPage += 1
        postData.page = currentPage
        r = await this.post(path, postData)
        data = r.data as BHDResponseData
        results = data.results
        const moreTorrents = this.parseTorrentPage(results)
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

  private parseTorrentPage(results: BHDTorrent[]): TorrentInfo[] {
    const torrents: TorrentInfo[] = []
    results.forEach((t) => {
      torrents.push({
        id: t.id.toString(),
        detailUrl: t.url,
        downloadUrl: t.url.replace('torrents', 'download'),
        title: t.name,
        subTitle: t.folder_name,
        releaseDate: Date.parse(t.created_at),
        catagory: t.category === 'TV' ? ETorrentCatagory.tv : ETorrentCatagory.movies,
        size: t.size,
        seeders: t.seeders,
        leechers: t.leechers,
        snatched: t.times_completed,
        promotion: this.parsePromotion(t),
      })
    })
    return torrents
  }

  private parsePromotion(t: BHDTorrent): TorrentPromotion | undefined {
    if (t.freeleech)
      return { status: ETorrentPromotion.free, isTemporary: false }

    if (t.promo25)
      return { status: ETorrentPromotion.quarter, isTemporary: false }

    if (t.promo75)
      return { status: ETorrentPromotion.threeQuarters, isTemporary: false }

    if (t.promo50)
      return { status: ETorrentPromotion.half, isTemporary: false }

    return undefined
  }

  private convertURL2POSTData(url: URL): BHDAPIPOSTData {
    const postData: BHDAPIPOSTData = { action: 'search' }
    const categoriesMap = new Map([['1', 'Movies'], ['2', 'TV']])
    const categoriesValue = url.searchParams.getAll('categories[]')
    if (categoriesValue)
      postData.categories = categoriesValue.map(v => categoriesMap.get(v)).join(',')

    const types = url.searchParams.getAll('types[]')
    if (types)
      postData.types = types.join(',')

    const sources = url.searchParams.getAll('sources[]')
    if (sources)
      postData.sources = sources.join(',')

    const search = url.searchParams.get('search')
    if (search)
      postData.search = search

    return postData
  }
}

const beyondhd = new BHD({
  name: 'BeyondHD',
  url: 'https://beyond-hd.me/',
})

export default beyondhd
