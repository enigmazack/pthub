import Site from './model/site'
import ourbits from './sites/ourbits'
import springsunday from './sites/springsunday'
import mteam from './sites/mteam'
import lemonhd from './sites/lemonhd'
import hdchina from './sites/hdchina'
import pterclub from './sites/pterclub'
import opencd from './sites/opencd'
import keepfrds from './sites/keepfrds'

export { ESiteStatus } from './enum'
export type { UserInfo, TorrentInfo } from './types'

export interface Sites {
  [key: string]: Site
}

const sites: Sites = {
  ourbits,
  springsunday,
  mteam,
  lemonhd,
  hdchina,
  pterclub,
  opencd,
  keepfrds
}

export default sites
