import jsSHA from 'jssha'
import _ from 'lodash'
import axios from 'axios'
import { ESiteStatus } from '~/sites'

/**
 * NEED HELP
 * bencode package is node based, vite(rollup) can't resolve it properly
 * I just browserify it manually
 */
declare global {
  interface Window {
    bencode: any
  }
}

const bencode = window.bencode

interface TorrentInfoFileDictionary {
  length: number
  path: Uint8Array[]
}

interface TorrentInfoDictionary {
  name: Uint8Array
  'piece length': number
  'pieces': Uint8Array
  files?: TorrentInfoFileDictionary[]
  length?: number
  private?: any
  [propName: string]: any
}

interface TorrentFileDictionary {
  announce: Uint8Array
  info: TorrentInfoDictionary
  'announce-list'?: Uint8Array[]
  [propName: string]: any
}

interface ContentFile {
  length: number
  path: string
}

export default class TorrentFile {
  url: string
  file: Blob | undefined
  name: string | undefined
  trakcerHost: string | undefined
  timeout: number
  files: ContentFile[] | undefined
  size: number | undefined
  hash: string | undefined
  cleanHash: string | undefined
  filesHash: string | undefined

  constructor(url: string, timeout?: number) {
    this.url = url
    this.timeout = timeout || 10000
  }

  async getTorrent(): Promise<ESiteStatus> {
    try {
      if (!this.file) {
        const r = await axios.get(this.url, {
          responseType: 'blob',
          timeout: this.timeout,
        })
        const torrentFile = r.data as Blob
        this.file = torrentFile
        const buffer = await torrentFile.arrayBuffer()
        const dict = bencode.decode(buffer) as TorrentFileDictionary
        this.name = dict.info.name.toString()
        this.trakcerHost = new URL(dict.announce.toString()).hostname
        this.files = this.getContentFiles(dict)
        let size = 0
        this.files.forEach((file) => { size += file.length })
        this.size = size
        this.hash = sha1(bencode.encode(dict.info))
        this.cleanHash = this.getCleanHash(dict)
        this.filesHash = sha1(bencode.encode(this.files))
      }
      return ESiteStatus.succeed
    }
    catch (error) {
      if (error instanceof Error && error.message.includes('timeout'))
        return ESiteStatus.timeout

      return ESiteStatus.getTorrentFailed
    }
  }

  setTimeout(timeout: number): void {
    this.timeout = timeout
  }

  private getContentFiles(dict: TorrentFileDictionary): ContentFile[] {
    const files: ContentFile[] = []
    if (dict.info.length !== undefined) {
      files.push({
        length: dict.info.length,
        path: dict.info.name.toString(),
      })
      return files
    }
    if (dict.info.files !== undefined) {
      for (const f of dict.info.files) {
        let filePath: string = dict.info.name.toString()
        for (const fp of f.path)
          filePath = `${filePath}/${fp.toString()}`

        files.push({
          length: f.length,
          path: filePath,
        })
      }
    }
    return _.sortBy(files, ['path'])
  }

  /**
   * Private trackers add some salty info to make the torrent unique, when
   * comparing torrents from different tracker we should use this 'clean hash'.
   * Another filesHash in this class is the hash of files path and size.
   * People sometimes remake the torrent and use a different piece length or change
   * the files order, which makes torrent's hash varies but the contents are identically
   * the same. So we can use this 'files hash' to compare torrents.
   * @param dict
   * @returns
   */
  private getCleanHash(dict: TorrentFileDictionary): string {
    const cleanInfo: TorrentInfoDictionary = { ...dict.info }
    const keepKeys: string[] = ['length', 'files', 'name', 'piece length', 'pieces']
    for (const key in cleanInfo) {
      if (!keepKeys.includes(key))
        delete cleanInfo[key]
    }
    return sha1(bencode.encode(cleanInfo))
  }
}

function sha1(content: Uint8Array): string {
  // eslint-disable-next-line new-cap
  const shaObj = new jsSHA('SHA-1', 'UINT8ARRAY')
  shaObj.update(content)
  return shaObj.getHash('HEX')
}
