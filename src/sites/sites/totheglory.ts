import CommonSite from '../model/commonSite'
import { ETorrentCatagory, ETorrentPromotion } from '../enum'
import type { SeedingInfo, TorrentPromotion } from '../types'
import { parseSize } from '../utils'

class TTG extends CommonSite {
  protected indexPath = '/index.php'
  protected userPath = '/userdetails.php'
  protected userIdRegex = /userdetails\.php\?id=(\d+)/
  protected defaultSearchPattern = '/browse.php?search_field={}&c=M'

  protected parseUserName(query: JQuery<Document>): string {
    const name = query.find('a[href*="userdetails.php?id="]').first().text()
    return name
  }

  protected parseJoinDate(query: JQuery<Document>): number {
    const joinDateString = this.someSelector(query, [
      'td.rowhead:contains("注册日期")',
      'td.rowhead:contains("Join"):contains("date")',
    ]).next().text()
    const joinDate = joinDateString ? Date.parse(joinDateString) : 0
    return joinDate
  }

  protected parseUpload(query: JQuery<Document>): number {
    const transfersString = this.someSelector(query, [
      'td.rowhead:contains("上传量")',
      'td.rowhead:contains("Uploaded")',
    ]).next().text()
    const upload = parseSize(transfersString)
    return upload
  }

  protected parseDownload(query: JQuery<Document>): number {
    const transfersString = this.someSelector(query, [
      'td.rowhead:contains("下载量")',
      'td.rowhead:contains("Downloaded")',
    ]).next().text()
    const download = parseSize(transfersString)
    return download
  }

  protected parseUserClass(query: JQuery<Document>): string {
    const userClass = this.someSelector(query, [
      'td.rowhead:contains("等级")',
      'td.rowhead:contains("Class")',
    ]).next().text()
    return userClass
  }

  protected parseBonus(query: JQuery<Document>): number {
    const bonusString = this.someSelector(query, [
      'td.rowhead:contains("积分")',
      'td.rowhead:contains("Bonus")',
    ]).next().text()
    const bonus = parseFloat(bonusString)
    return bonus
  }

  protected async getSeedingInfo(query: JQuery<Document>): Promise<SeedingInfo> {
    const seedingTable = this.someSelector(query, [
      'td.rowhead:contains("当前上传")',
      'td.rowhead:contains("Currently seeding")',
    ]).next().find('table').first()
    const rows = seedingTable.find('> tbody > tr')
    let seedingSize = 0
    const seedingList: string[] = []
    for (let i = 1; i < rows.length; i++) {
      const row = rows.eq(i)
      const idString = row.find('a[href*="details.php?id="]').attr('href')
      const idMatch = idString ? idString.match(/details.php\?id=(\d+)/) : undefined
      const id = idMatch ? idMatch[1] : undefined
      if (id)
        seedingList.push(id)

      const sizeString = row.find('> td').eq(3).html().replace('<br>', ' ')
      const size = parseSize(sizeString)
      seedingSize += size
    }
    const seeding = seedingList.length
    return { seeding, seedingSize, seedingList }
  }

  protected findTorrentRows = (query: JQuery<Document>): JQuery<HTMLElement> => {
    const table = query.find('table#torrent_table').last()
    const rows = table.find('> tbody > tr:not(:eq(0))')
    return rows
  }

  protected parseTorrentCatagory = (query: JQuery<HTMLElement>): ETorrentCatagory => {
    const map = new Map()
    map.set('电影DVDRip', ETorrentCatagory.movies)
    map.set('电影720p', ETorrentCatagory.movies)
    map.set('电影1080i/p', ETorrentCatagory.movies)
    map.set('BluRay原盘', ETorrentCatagory.movies)
    map.set('影视2160p', ETorrentCatagory.movies)
    map.set('UHD原盘', ETorrentCatagory.movies)
    map.set('纪录片720p', ETorrentCatagory.documentary)
    map.set('纪录片1080i/p', ETorrentCatagory.documentary)
    map.set('纪录片BluRay原盘', ETorrentCatagory.documentary)
    map.set('欧美剧720p', ETorrentCatagory.tv)
    map.set('欧美剧1080i/p', ETorrentCatagory.tv)
    map.set('高清日剧', ETorrentCatagory.tv)
    map.set('大陆港台剧1080i/p', ETorrentCatagory.tv)
    map.set('大陆港台剧720p', ETorrentCatagory.tv)
    map.set('高清韩剧', ETorrentCatagory.tv)
    map.set('欧美剧包', ETorrentCatagory.tv)
    map.set('日剧包', ETorrentCatagory.tv)
    map.set('华语剧包', ETorrentCatagory.tv)
    map.set('韩剧包', ETorrentCatagory.tv)
    map.set('(电影原声&Game)OST', ETorrentCatagory.music)
    map.set('无损音乐FLAC&APE', ETorrentCatagory.music)
    map.set('MV&演唱会', ETorrentCatagory.mv)
    map.set('高清体育节目', ETorrentCatagory.sports)
    map.set('高清动漫', ETorrentCatagory.animation)
    map.set('韩国综艺', ETorrentCatagory.tv)
    map.set('高清综艺', ETorrentCatagory.tv)
    map.set('日本综艺', ETorrentCatagory.tv)
    map.set('MiniVideo', ETorrentCatagory.movies)
    map.set('补充音轨', ETorrentCatagory.other)
    map.set('iPhone/iPad视频', ETorrentCatagory.movies)
    map.set('PC', ETorrentCatagory.games)
    map.set('MAC', ETorrentCatagory.games)
    map.set('XBOX360', ETorrentCatagory.games)
    map.set('XBOX1', ETorrentCatagory.games)
    map.set('XBLA', ETorrentCatagory.games)
    map.set('PS2', ETorrentCatagory.games)
    map.set('PSP', ETorrentCatagory.games)
    map.set('PS4', ETorrentCatagory.games)
    map.set('PS3', ETorrentCatagory.games)
    map.set('PSV', ETorrentCatagory.games)
    map.set('WIIU', ETorrentCatagory.games)
    map.set('WII', ETorrentCatagory.games)
    map.set('SWITCH', ETorrentCatagory.games)
    map.set('NDS', ETorrentCatagory.games)
    map.set('NGC', ETorrentCatagory.games)
    map.set('PS3兼容高清', ETorrentCatagory.movies)
    map.set('PSP兼容高清&标清', ETorrentCatagory.movies)
    map.set('XBOX360兼容高清', ETorrentCatagory.movies)
    map.set('Game Video', ETorrentCatagory.movies)
    map.set('APPZ', ETorrentCatagory.application)
    map.set('Game Ebook', ETorrentCatagory.ebook)
    map.set('Ebook', ETorrentCatagory.ebook)
    const cKey = this.parseTorrentCatagoryKey(query)
    const catagory = cKey ? map.get(cKey) : undefined
    return catagory || ETorrentCatagory.other
  }

  protected parseTorrentCatagoryKey = (query: JQuery<HTMLElement>): string | undefined => {
    const cKey = query.find('> td').eq(0).find('img').attr('alt')
    return cKey
  }

  protected parseTorrentSeeding = (query: JQuery<HTMLElement>): boolean | undefined => {
    const seeding = !!query.find('div.green').length
    return seeding
  }

  protected parseTorrentPromotion = (query: JQuery<HTMLElement>): TorrentPromotion | undefined => {
    const map = new Map()
    map.set('free', ETorrentPromotion.free)
    map.set('50%', ETorrentPromotion.half)
    map.set('30%', ETorrentPromotion.thirtyPercent)
    const promotionString = this.someSelector(query, [
      'img[alt="free"]',
      'img[alt="50%"]',
      'img[alt="30%"]',
    ]).attr('alt')
    const status = map.get(promotionString)
    const isTemporary = !!this.someSelector(query, [
      'span:contains("剩余")',
      'span:contains("remain")',
    ]).length
    const promotion = status ? { status, isTemporary } : undefined
    return promotion
  }

  protected parseTorrentId = (query: JQuery<HTMLElement>): string => {
    const idString = query.find('a[href*="/t/"]').attr('href')
    const idMatch = idString ? idString.match(/\/t\/(\d+)\//) : undefined
    const id = idMatch ? idMatch[1] : ''
    return id
  }

  protected parseTorrentTitle = (query: JQuery<HTMLElement>): string => {
    return query.find('a[href*="/t/"]').find('> b').html().split('<')[0].trim()
      || query.find('a[href*="/t/"]').find('> b > font').html().split('<')[0].trim() || ''
  }

  protected parseTorrentSubTitle = (query: JQuery<HTMLElement>): string | undefined => {
    return query.find('a[href*="/t/"]').find('> b > span').last().text()
      || query.find('a[href*="/t/"]').find('> b > font > span').last().text() || ''
  }

  protected parseTorrentReleaseDate = (query: JQuery<HTMLElement>): number => {
    const dateString = query.find('> td').eq(4).find('nobr').html().replace('<br>', ' ')
    const releaseDate = dateString ? Date.parse(dateString) : 0
    return releaseDate
  }

  protected parseTorrentSize = (query: JQuery<HTMLElement>): number => {
    const sizeString = query.find('> td').eq(6).html().replace('<br>', ' ')
    const size = sizeString ? parseSize(sizeString) : 0
    return size
  }

  protected parseTorrentSeeders = (query: JQuery<HTMLElement>): number => {
    const seedersString = query.find('> td').eq(8).find('a[href*="toseeders"]').text()
    const seeders = seedersString ? parseInt(seedersString) : 0
    return seeders
  }

  protected parseTorrentLeechers = (query: JQuery<HTMLElement>): number => {
    const leechersString = query.find('> td').eq(8).find('a[href*="todlers"]').text()
    const leechers = leechersString ? parseInt(leechersString) : 0
    return leechers
  }

  protected parseTorrentSnatched = (query: JQuery<HTMLElement>): number => {
    const leechersString = query.find('> td').eq(7).html().split('<br>')[0]
    const leechers = leechersString ? parseInt(leechersString) : -1
    return leechers
  }

  protected parseTorrentDetailsUrl = (query: JQuery<HTMLElement>): string => {
    const url = new URL(this.url.href)
    const detailPath = query.find('a[href*="/t/"]').attr('href')
    if (detailPath)
      url.pathname = detailPath

    return url.href
  }

  protected parseTorrentDownloadUrl = (query: JQuery<HTMLElement>): string => {
    const url = new URL(this.url.href)
    const downloadPath = query.find('a[href*="/dl/"]').attr('href')
    if (downloadPath)
      url.pathname = downloadPath

    return url.href
  }
}

const totheglory = new TTG({
  name: 'TTG',
  url: 'https://totheglory.im/',
})

export default totheglory
