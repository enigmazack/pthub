import NexusPHPSite from '../model/nexusPHPSite'
import { ETorrentCatagory } from '../enum'

class Putao extends NexusPHPSite {
  protected async getSeedingInfoAsQuery(): Promise<JQuery<Document>> {
    const query = await this.getAsQuery(`/viewusertorrents.php?show=seeding&id=${this.userId}`)
    return query
  }

  protected parseJoinDate(query: JQuery<Document>): number {
    const joinDateString = this.someSelector(query, [
      'td.rowhead:contains("加入日期")',
      'td.rowhead:contains("Join"):contains("date")',
    ]).next().text().split('(')[0].trim()
    const joinDate = joinDateString ? Date.parse(joinDateString) : 0
    return joinDate
  }

  protected parseTorrentReleaseDate = (query: JQuery<HTMLElement>): number => {
    const dateString = query.find('> td').eq(this.tableIndex.releaseDate).find('> span').html().replace('<br>', ' ')
    const releaseDate = dateString ? Date.parse(dateString) : 0
    return releaseDate
  }

  protected parseTorrentSeeding = (query: JQuery<HTMLElement>): boolean | undefined => {
    return !!query.find('> td').eq(this.tableIndex.snatched).attr('title')?.match(/在做种/)
  }

  protected parseTorrentCatagory = (query: JQuery<HTMLElement>): ETorrentCatagory => {
    const map = new Map()
    map.set('401', ETorrentCatagory.movies)
    map.set('402', ETorrentCatagory.movies)
    map.set('403', ETorrentCatagory.movies)
    map.set('406', ETorrentCatagory.documentary)
    map.set('407', ETorrentCatagory.tv)
    map.set('408', ETorrentCatagory.tv)
    map.set('409', ETorrentCatagory.tv)
    map.set('410', ETorrentCatagory.tv)
    map.set('411', ETorrentCatagory.tv)
    map.set('412', ETorrentCatagory.tv)
    map.set('413', ETorrentCatagory.tv)
    map.set('414', ETorrentCatagory.tv)
    map.set('420', ETorrentCatagory.music)
    map.set('421', ETorrentCatagory.music)
    map.set('422', ETorrentCatagory.music)
    map.set('423', ETorrentCatagory.music)
    map.set('425', ETorrentCatagory.music)
    map.set('426', ETorrentCatagory.music)
    map.set('427', ETorrentCatagory.mv)
    map.set('429', ETorrentCatagory.games)
    map.set('431', ETorrentCatagory.animation)
    map.set('432', ETorrentCatagory.sports)
    map.set('434', ETorrentCatagory.application)
    map.set('435', ETorrentCatagory.learning)
    map.set('440', ETorrentCatagory.application)
    map.set('451', ETorrentCatagory.other)
    map.set('450', ETorrentCatagory.other)
    const cKey = this.parseTorrentCatagoryKey(query)
    const catagory = cKey ? map.get(cKey) : undefined
    return catagory || ETorrentCatagory.other
  }
}

const putao = new Putao({
  name: 'Putao',
  url: 'https://pt.sjtu.edu.cn/',
})

export default putao
