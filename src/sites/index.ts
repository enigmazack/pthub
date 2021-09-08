import Site, { UserInfo } from './model/site'
import ourbits from './ourbits'
import springsunday from './springsunday'
import mteam from './mteam'
import lemonhd from './lemonhd'
import hdchina from './hdchina'
import pterclub from './pterclub'
import opencd from './opencd'
import keepfrds from './keepfrds'
import { ESiteStatus } from './model/enum'

export {
  ESiteStatus,
  UserInfo
}

interface Sites {
  [key: string]: Site
}

const sites:Sites = {
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
