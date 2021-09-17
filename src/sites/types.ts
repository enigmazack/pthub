import {
  ETorrentCatagory,
  ETorrentPromotion
} from './enum'
import { AxiosResponse } from 'axios'

export interface UserInfo {
  name: string,
  id?: string,
  joinDate?: number,
  upload?: number,
  download?: number,
  ratio?: number,
  userClass?: string,
  bonus?: number,
  seeding?: number,
  seedingSize?: number,
  seedingList?: string[]
}

export interface SiteConfig {
  name: string,
  url: string,
  icon?: string
}

export interface RequestCache {
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: Promise<AxiosResponse<any>>
  time: number
}

export interface SeedingInfo {
  seeding: number,
  seedingSize: number,
  seedingList?: string[]
}

export interface TorrentPromotion {
  status: ETorrentPromotion,
  type: 'temporary'|'permanent'
  expire?: number
}

export interface TorrentInfo {
  id: string,
  downloadUrl: string,
  detailUrl: string,
  title: string,
  releaseDate: number,
  subTitle?: string,
  catagory?: ETorrentCatagory,
  size: number,
  seeders: number,
  leechers: number,
  seeding?: boolean,
  promotion?: TorrentPromotion,
}

export interface SearchConfigParams {
  [key: string]: string
}
