import Site from './model/site'
import ourbits from './sites/ourbits'
import springsunday from './sites/springsunday'
import mteam from './sites/mteam'
import lemonhd from './sites/lemonhd'
import hdchina from './sites/hdchina'
import pterclub from './sites/pterclub'
import opencd from './sites/opencd'
import keepfrds from './sites/keepfrds'
import hdroute from './sites/hdroute'
import totheglory from './sites/totheglory'
import broadcasthenet from './sites/broadcasthenet'
import passthepopcorn from './sites/passthepopcorn'
import putao from './sites/putao'
import redacted from './sites/redacted'
import orpheus from './sites/orpheus'
import dicmusic from './sites/dicmusic'
import greatposterwall from './sites/greatposterwall'
import jpopsuki from './sites/jpopsuki'
import filelist from './sites/filelist'
import beyondhd from './sites/beyondhd'
import teamhd from './sites/teamhd'

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
  keepfrds,
  hdroute,
  totheglory,
  broadcasthenet,
  passthepopcorn,
  putao,
  redacted,
  orpheus,
  dicmusic,
  greatposterwall,
  jpopsuki,
  filelist,
  beyondhd,
  teamhd
}

export default sites
