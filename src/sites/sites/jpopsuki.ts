import { parseInt } from 'lodash'
import { ESiteStatus, ETorrentCatagory, ETorrentPromotion } from '../enum'
import GazelleSite from '../model/gazelleSite'
import type { SeedingInfo, SeedingTorrentInfo, TorrentInfo } from '../types'
import { parseSize } from '../utils'

class JPOP extends GazelleSite {
  protected async getSeedingInfo(): Promise<SeedingInfo> {
    const seedingTorrents = await this.parsePagination(
      `/torrents.php?type=seeding&userid=${this.userId}`, this.parseSeedingInfoPage, 1,
    )
    const seeding = seedingTorrents.length
    let seedingSize = 0
    seedingTorrents.forEach((t) => { seedingSize += t.size })
    const seedingList = seedingTorrents.map(t => t.id)
    return { seeding, seedingSize, seedingList }
  }

  private parseSeedingInfoPage = (query: JQuery<Document>): SeedingTorrentInfo[] => {
    const seedingTorrents: SeedingTorrentInfo[] = []
    const rows = query.find('table#torrent_table > tbody > tr:not(:eq(0))')
    for (let i = 0; i < rows.length; i++) {
      const row = rows.eq(i)
      const idString = row.find('a[href*="torrents.php?id="]').attr('href')
      const idMatch = idString ? idString.match(/torrentid=(\d+)/) : undefined
      const id = idMatch ? idMatch[1] : undefined
      const size = parseSize(row.find('> td').eq(5).text().trim())
      if (id)
        seedingTorrents.push({ id, size })
    }
    return seedingTorrents
  }

  async search(keywords: string, expectTorrents: number, pattern?: string): Promise<TorrentInfo[] | ESiteStatus> {
    try {
      if (!pattern)
        pattern = '/ajax.php?section=torrents&searchstr={}'

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
    const rows = query.find('table#torrent_table > tbody > tr:not(:eq(0))')
    for (let i = 0; i < rows.length; i++) {
      const row = rows.eq(i)
      const rowClass = row.attr('class')
      if (rowClass === 'torrent_redline') {
        const idString = row.find('a[href*="torrents.php?id="]').attr('href')
        const idMatch = idString ? idString.match(/torrentid=(\d+)/) : undefined
        const id = idMatch ? idMatch[1] : ''
        const detailUrl = this.url.href + row.find('a[href*="torrents.php?id="]').attr('href')
        const downloadUrl = this.url.href + row.find('a[href*="torrents.php?action=download"]').attr('href')
        const title = `${row.find('a[href*="artist.php?id="]').text()} - ${
          row.find('a[href*="torrents.php?id="]').first().text()}`
        const subTitleString = row.find('> td').eq(3).text()
        const subTitleMatch = subTitleString.match(/\[(.*?)\]/)
        const subTitle = subTitleMatch ? subTitleMatch[1] : ''
        const releaseDateString = row.find('> td').eq(5).attr('title')
        const releaseDate = releaseDateString ? Date.parse(releaseDateString) : 0
        const size = parseSize(row.find('> td').eq(6).text())
        const seeders = parseInt(row.find('> td').eq(8).text())
        const leechers = parseInt(row.find('> td').eq(9).text())
        const snatched = parseInt(row.find('> td').eq(7).text())
        const promotion = subTitle.match(/Freelecch!/)
          ? { status: ETorrentPromotion.free, isTemporary: false }
          : undefined
        const catagory = ETorrentCatagory.music
        torrents.push({
          id,
          detailUrl,
          downloadUrl,
          title,
          subTitle,
          releaseDate,
          size,
          seeders,
          leechers,
          snatched,
          promotion,
          catagory,
        })
      }
      if (rowClass && rowClass.includes('group_torrent_redline')) {
        const groupIdMatch = rowClass.match(/groupid_(\d+)/)
        const groupId = groupIdMatch ? groupIdMatch[1] : ''
        const groupQuery = query.find(`a[href*="torrents.php?id=${groupId}"]`).parent()
        const title = `${groupQuery.find('a[href*="artist.php?id="]').text()} - ${
          groupQuery.find('a[href*="torrents.php?id="]').first().text()}`
        const idString = row.find('a[href*="torrents.php?id="]').attr('href')
        const idMatch = idString ? idString.match(/torrentid=(\d+)/) : undefined
        const id = idMatch ? idMatch[1] : ''
        const subTitle = row.find('a[href*="torrents.php?id="]').text()
        const detailUrl = this.url.href + row.find('a[href*="torrents.php?id="]').attr('href')
        const downloadUrl = this.url.href + row.find('a[href*="torrents.php?action=download"]').attr('href')
        const releaseDateString = row.find('> td').eq(2).attr('title')
        const releaseDate = releaseDateString ? Date.parse(releaseDateString) : 0
        const size = parseSize(row.find('> td').eq(3).text())
        const seeders = parseInt(row.find('> td').eq(5).text())
        const leechers = parseInt(row.find('> td').eq(6).text())
        const snatched = parseInt(row.find('> td').eq(4).text())
        const promotion = subTitle.match(/Freelecch!/)
          ? { status: ETorrentPromotion.free, isTemporary: false }
          : undefined
        const catagory = ETorrentCatagory.music
        torrents.push({
          id,
          detailUrl,
          downloadUrl,
          title,
          subTitle,
          releaseDate,
          size,
          seeders,
          leechers,
          snatched,
          promotion,
          catagory,
        })
      }
    }
    return torrents
  }
}

const jpopsuki = new JPOP({
  name: 'JPOP',
  url: 'https://jpopsuki.eu/',
})

export default jpopsuki
