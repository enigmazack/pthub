import type {
  ETorrentCatagory,
  ETorrentPromotion,
} from './enum'

export interface UserInfo {
  name: string
  id: string
  joinDate: number
  upload: number
  download: number
  userClass: string
  bonus: number
  seeding: number
  seedingSize: number
  seedingList: string[]
}

export type SeedingInfo = Pick<UserInfo, 'seeding' | 'seedingSize' | 'seedingList'>

export interface SiteConfig {
  name: string
  url: string
  icon?: string
}

export interface TorrentPromotion {
  status: ETorrentPromotion
  isTemporary: boolean
}

export interface TorrentInfo {
  id: string
  downloadUrl: string
  detailUrl: string
  title: string
  releaseDate: number
  subTitle?: string
  catagory?: ETorrentCatagory
  size: number
  seeders: number
  leechers: number
  snatched: number
  seeding?: boolean
  promotion?: TorrentPromotion
}

export type SeedingTorrentInfo = Pick<TorrentInfo, 'id' | 'size'>
