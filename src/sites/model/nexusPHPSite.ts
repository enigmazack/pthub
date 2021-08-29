/* eslint-disable @typescript-eslint/no-explicit-any */
import Site, { userInfo, SeedingInfo } from './site'

export default class NexusPHPSite extends Site {
  async checkConnection (): Promise<string> {
    try {
      let isLogin = false
      const r = await this.get('/index.php', false)
      if (r.request && r.request.responseURL) {
        isLogin = r.request.responseURL.match(/index\.php/)
      }
      return isLogin ? 'connected_with_login' : 'connected_without_login'
    } catch {
      return 'no_connection'
    }
  }

  async getUserId (): Promise<string> {
    try {
      const r = await this.get('/index.php')
      const id = r.data.match(/userdetails\.php\?id=(\d+)/)[1]
      return id
    } catch {
      return 'unknow'
    }
  }

  protected parseUserName (query: JQuery<any>): string {
    const name = query.find('a[href*="userdetails.php?id="]').first().text()
    return name
  }

  protected parseJoinDate (query: JQuery<any>): number|undefined {
    const joinDateString = this.someSelector(query, [
      'td.rowhead:contains("加入日期")',
      'td.rowhead:contains("Join"):contains("date")'
    ]).next().find('span').attr('title')
    const joinDate = joinDateString ? Date.parse(joinDateString) : undefined
    return joinDate
  }

  protected parseUpload (query: JQuery<any>): number {
    const transfersString = this.someSelector(query, [
      'td.rowhead:contains("传输")',
      'td.rowhead:contains("傳送")',
      'td.rowhead:contains("Transfers")'
    ]).next().text()
    const uploadMatch = transfersString.match(/(上[传傳]量|Uploaded).+?(\d+\.?\d* *[ZEPTGMK]?i?B)/)
    const uploadString = uploadMatch ? uploadMatch[2] : ''
    const upload = this.parseSize(uploadString)
    return upload
  }

  protected parseDownload (query: JQuery<any>): number {
    const transfersString = this.someSelector(query, [
      'td.rowhead:contains("传输")',
      'td.rowhead:contains("傳送")',
      'td.rowhead:contains("Transfers")'
    ]).next().text()
    const downloadMatch = transfersString.match(/(下[载載]量|Downloaded).+?(\d+\.?\d* *[ZEPTGMK]?i?B)/)
    const downloadString = downloadMatch ? downloadMatch[2] : ''
    const download = this.parseSize(downloadString)
    return download
  }

  protected parseUserClass (query: JQuery<any>): string {
    const userClass = this.someSelector(query, [
      'td.rowhead:contains("等级")',
      'td.rowhead:contains("等級")',
      'td.rowhead:contains("Class")'
    ]).next().find('img').attr('title') || ''
    return userClass
  }

  protected parseBonus (query: JQuery<any>): number {
    const bonusString = this.someSelector(query, [
      'td.rowhead:contains("魔力值")',
      'td.rowhead:contains("Karma"):contains("Points")'
    ]).next().text()
    const bonus = parseFloat(bonusString)
    return bonus
  }

  protected async getSeedingInfo (id: string): Promise<SeedingInfo> {
    const rSeeding = await this.get(`/getusertorrentlistajax.php?userid=${id}&type=seeding`)
    const query = this.parseHTML(rSeeding.data)
    const seedingString = query.find('b').first().text()
    const seeding = parseInt(seedingString)
    const rows = query.find('tr')
    let seedingSize = 0
    const seedingList: string[] = []
    for (let i = 1; i < rows.length; i++) {
      const row = rows.eq(i)
      const torrentIdString = row.find('a[href*="details.php?id="]').attr('href')
      const torrentIdMatch = torrentIdString ? torrentIdString.match(/details.php\?id=(\d+)/) : undefined
      const torrentId = torrentIdMatch ? torrentIdMatch[1] : undefined
      if (torrentId) {
        seedingList.push(torrentId)
      }
      const torrentSizeString = row.find('td').eq(2).text()
      const torrentSizeThis = torrentSizeString ? this.parseSize(torrentSizeString) : 0
      seedingSize += torrentSizeThis
    }
    return { seeding, seedingSize, seedingList }
  }

  async getUserInfo (): Promise<userInfo|string> {
    try {
      const id = await this.getUserId()
      const r = await this.get(`/userdetails.php?id=${id}`)
      const query = this.parseHTML(r.data)
      // user name
      const name = this.parseUserName(query)
      // join date
      const joinDate = this.parseJoinDate(query)
      // upload download ratio
      const upload = this.parseUpload(query)
      const download = this.parseDownload(query)
      const ratio = upload / download
      // user class
      const userClass = this.parseUserClass(query)
      // bonus
      const bonus = this.parseBonus(query)
      // seeding size list
      const seedingInfo = await this.getSeedingInfo(id)
      return {
        name,
        id,
        joinDate,
        upload,
        download,
        ratio,
        bonus,
        userClass,
        ...seedingInfo
      }
    } catch (err) {
      console.log(err)
      return 'failed'
    }
  }
}
