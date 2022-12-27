<script lang="ts" setup>
import { CloseCircleOutlined, CloudUploadOutlined, DownloadOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import PQueue from 'p-queue'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import filesize from 'file-size'
import { saveAs } from 'file-saver'
import bus from '../bus'
import TorrentFile from '../torrent'
import SeedingFilled from '~icons/ri/seedling-fill'
import { useStore } from '~/store'
import type { Sites, TorrentInfo } from '~/sites'
import { ESiteStatus } from '~/sites'

interface TorrentProps extends TorrentInfo {
  key: string
  siteKey: string
}

interface CrossSeedTorrentProps {
  siteKey: string
  url: string
  name: string
  size: number
  hash: string
  cleanHash: string
  filesHash: string
  status: string
  match: string
}

interface SearchConfigProps {
  siteKey: string
  pattern?: string
}

interface SearchStatusProps {
  status: ESiteStatus
  torrentCounts: number
}

function genSorter<T = SearchConfigProps>(prop: keyof T) {
  return (a: T, b: T): number => {
    const ap = a[prop]
    const bp = b[prop]
    if (typeof ap === 'string' && typeof bp === 'string') {
      if (ap.toUpperCase() < bp.toUpperCase())
        return -1
      if (ap.toUpperCase() > bp.toUpperCase())
        return 1
      return 0
    }
    if (typeof ap === 'number' && typeof bp === 'number')
      return ap - bp
    return 0
  }
}

const columns = [
  {
    key: 'site',
    align: 'center',
    slots: { title: 'siteTitle', customRender: 'site' },
  },
  {
    key: 'torrentTitle',
    // ellipsis: true,
    width: '60%',
    slots: { title: 'titleTitle', customRender: 'torrentTitle' },
  },
  {
    key: 'catagory',
    dataIndex: 'catagory',
    align: 'right',
    slots: { title: 'catagoryTitle', customRender: 'catagory' },
  },
  {
    key: 'size',
    align: 'right',
    slots: { title: 'sizeTitle', customRender: 'size' },
    sorter: genSorter('size'),
  },
  {
    key: 'seeders',
    dataIndex: 'seeders',
    align: 'right',
    slots: { title: 'seedersTitle' },
    sorter: genSorter('seeders'),
  },
  {
    key: 'leechers',
    dataIndex: 'leechers',
    align: 'right',
    slots: { title: 'leechersTitle' },
    sorter: genSorter('leechers'),
  },
  {
    key: 'snatched',
    dataIndex: 'snatched',
    align: 'right',
    slots: { title: 'snatchedTitle' },
    sorter: genSorter('snatched'),
  },
  {
    key: 'releaseDate',
    align: 'right',
    slots: { title: 'releaseDateTitle', customRender: 'releaseDate' },
    sorter: genSorter('releaseDate'),
  },
  {
    key: 'operation',
    align: 'center',
    slots: { title: 'operationTitle', customRender: 'operation' },
  },
]

const sites = inject('sites') as Sites
const store = useStore()

// read settings and params from store
const searchText = computed(() => store.state.params.searchText)
const expectTorrents = computed(() => store.state.siteSettings.expectTorrents)
const enabledSites = computed(() => store.state.siteSettings.enabledSites)
const selectedConfig = computed(() => store.state.siteSettings.selectedConfig)

// pick selected config
const configList = computed<SearchConfigProps[]>(() => {
  if (selectedConfig.value === 'default') {
    return enabledSites.value.map(siteKey => Object({ siteKey }))
  }
  else {
    return store.state.siteSettings.searchConfigs.filter(
      config => config.name === selectedConfig.value,
    ).filter(
      config => enabledSites.value.includes(config.siteKey),
    ).map(config => Object({ siteKey: config.siteKey, pattern: config.pattern }))
  }
})

// pick sites depending on the configs
const activeSites = computed(() => _.uniq(configList.value.map(config => config.siteKey)))

// set filters
const filterSite = ref('all')
const isFilterSite = (siteKey: string) => siteKey === filterSite.value
const toggleFilterSite = _.debounce((siteKey: string) => {
  filterSite.value = filterSite.value === siteKey ? 'all' : siteKey
}, 500)
const filterText = ref('')

// all search results store in 'tList' locally
const tList = reactive<TorrentProps[]>([])

// is a torrent seeding, if torrent.seeding is true or check the seeding list of the user data
const isSeeding = (t: TorrentProps): boolean => {
  if (t.seeding)
    return true

  let seeding = false
  const userData = store.getters.getUserData(t.siteKey)
  const seedingList = userData?.seedingList
  seeding = !!seedingList?.find(id => id === t.id)
  return seeding
}

// display torrents are tList filter by search text and selected site
const displayTorrents = computed(
  () => _.sortBy(
    _.uniqWith(
      tList,
      (t1: TorrentProps, t2: TorrentProps) => t1.siteKey === t2.siteKey && t1.id === t2.id,
    ).filter(
      torrent => filterSite.value === 'all' || torrent.siteKey === filterSite.value,
    ).filter(
      torrent => !filterText.value || filterText.value.toLowerCase().split(' ').some(word =>
        torrent.title.toLowerCase().includes(word)
            || (torrent.subTitle && torrent.subTitle.toLowerCase().includes(word)),
      ),
    ),
    // sort by release data
    t => -t.releaseDate,
  ),
)

// local store to contain site searching status
const searchStatus = reactive<Record<string, SearchStatusProps>>({})

// queue for async calling, guarantee acceptable payloads
const queue = new PQueue({ concurrency: store.state.siteSettings.concurrencyRequests })

const reset = () => {
  // clear the queue of async callings
  queue.clear()
  // clear the reactives
  Object.keys(searchStatus).forEach((siteKey) => {
    delete searchStatus[siteKey]
  })
  tList.splice(0, tList.length)
  // init the searching status
  activeSites.value.forEach((siteKey) => {
    searchStatus[siteKey] = { status: ESiteStatus.unknow, torrentCounts: NaN }
  })
}

const search = _.debounce((siteKey?: string) => {
  // if no site specified, search all the active sites
  if (!siteKey) {
    reset()
  }
  else {
    // if site specified, remove torrents of this site from tList
    _.remove(tList, t => t.siteKey === siteKey)
  }
  const siteList = siteKey ? [siteKey] : activeSites.value
  siteList.forEach((sKey) => {
    searchStatus[sKey].status = ESiteStatus.unknow
    let torrentCounts = 0
    let searchCounts = 0
    let succeedCounts = 0
    // in most case one config per site, but some site may have more
    const cList = configList.value.filter(config => config.siteKey === sKey)
    cList.forEach(async (config) => {
      const torrents = await queue.add(() => {
        // change the status into connecting
        if (searchCounts === 0)
          searchStatus[sKey].status = ESiteStatus.connecting

        // call the sites method search
        return sites[sKey].search(searchText.value, expectTorrents.value, config.pattern)
      })
      searchCounts += 1
      if (typeof torrents !== 'string') {
        const ts: TorrentProps[] = torrents.map(t => Object({ key: uuidv4(), siteKey: sKey, ...t }))
        torrentCounts += ts.length
        succeedCounts += 1
        ts.forEach(t => tList.push(t))
      }
      else {
        searchStatus[sKey].status = torrents
      }
      // only when all async calling of the cList finished with no error
      if (succeedCounts === cList.length) {
        searchStatus[sKey].status = ESiteStatus.succeed
        searchStatus[sKey].torrentCounts = torrentCounts
      }
    })
  })
}, 1000)

onMounted(() => {
  reset()
  bus.on('search', search)
})

// when enabled sites changed, reset the page
watch(() => store.state.siteSettings.enabledSites.length, () => { reset() })
// when seleted config changed, reset the page
watch(() => store.state.siteSettings.selectedConfig, () => { reset() })

/**
     * cross seeding
     */
const crossSeedVisible = ref<boolean>(false)
const okButtonDisabled = ref<boolean>(true)
const targetTorrent = ref<TorrentProps>()
const crossSeedTorrents = reactive<Record<string, CrossSeedTorrentProps>>({})
const tFiles: Record<string, TorrentFile> = {}

const setCrossSeedTorrent = (tf: TorrentFile, t: TorrentProps) => {
  crossSeedTorrents[t.key] = {
    siteKey: t.siteKey,
    url: tf.url,
    name: tf.name || '',
    size: tf.size || 0,
    hash: tf.hash || '',
    cleanHash: tf.cleanHash || '',
    filesHash: tf.filesHash || '',
    status: ESiteStatus.unknow,
    match: 'self',
  }
}

const doCrossSeedAnalysis = async (t: TorrentProps) => {
  targetTorrent.value = t
  // clear torrentFiles
  Object.keys(crossSeedTorrents).forEach((key) => { delete crossSeedTorrents[key] })
  Object.keys(tFiles).forEach((key) => { delete tFiles[key] })
  // open the view
  crossSeedVisible.value = true
  okButtonDisabled.value = true

  // select torrents by size from the tList to analysis
  const torrentList: TorrentProps[] = []
  tList.filter(torrent => torrent.key !== t.key && !isSeeding(torrent)
        && Math.abs(filesize(torrent.size).calculate().result - filesize(t.size).calculate().result) <= 0.01)
    .forEach((torrent) => { torrentList.push(torrent) })

  // set the torrent files
  tFiles[t.key] = new TorrentFile(t.downloadUrl)
  torrentList.forEach((torrent) => { tFiles[torrent.key] = new TorrentFile(torrent.downloadUrl) })
  const timeout = store.state.siteSettings.timeout
  Object.keys(tFiles).forEach((key) => { tFiles[key].setTimeout(timeout) })

  setCrossSeedTorrent(tFiles[t.key], t)
  torrentList.forEach((torrent) => { setCrossSeedTorrent(tFiles[torrent.key], torrent) })

  crossSeedTorrents[t.key].status = ESiteStatus.connecting
  const tStatus = await tFiles[t.key].getTorrent()
  setCrossSeedTorrent(tFiles[t.key], t)
  crossSeedTorrents[t.key].status = tStatus
  if (tStatus !== ESiteStatus.succeed)
    return

  let counts = 0
  torrentList.forEach(async (torrent) => {
    const file = tFiles[torrent.key]
    crossSeedTorrents[torrent.key].status = ESiteStatus.connecting
    const status = await queue.add(() => file.getTorrent())
    setCrossSeedTorrent(file, torrent)
    crossSeedTorrents[torrent.key].status = status
    if (file.cleanHash && file.cleanHash === tFiles[t.key].cleanHash)
      crossSeedTorrents[torrent.key].match = 'cleanHash'
    else if (file.filesHash && file.filesHash === tFiles[t.key].filesHash)
      crossSeedTorrents[torrent.key].match = 'filesHash'
    else
      crossSeedTorrents[torrent.key].match = 'none'

    counts += 1
    if (counts === torrentList.length)
      okButtonDisabled.value = false
  })
}

const retryCrossSeedAnalysis = async (tKey: string) => {
  const torrent = tList.find(t => t.key === tKey)
  if (!targetTorrent.value || !torrent)
    return

  if (tKey === targetTorrent.value.key) {
    doCrossSeedAnalysis(torrent)
  }
  else {
    const t = targetTorrent.value
    const file = tFiles[tKey]
    crossSeedTorrents[tKey].status = ESiteStatus.connecting
    const status = await queue.add(() => file.getTorrent())
    setCrossSeedTorrent(file, torrent)
    crossSeedTorrents[tKey].status = status
    if (file.cleanHash && file.cleanHash === tFiles[t.key].cleanHash)
      crossSeedTorrents[tKey].match = 'cleanHash'
    else if (file.filesHash && file.filesHash === tFiles[t.key].filesHash)
      crossSeedTorrents[tKey].match = 'filesHash'
    else
      crossSeedTorrents[tKey].match = 'none'
  }
}

const downloadCompatibleTorrents = () => {
  Object.keys(crossSeedTorrents).forEach((key) => {
    const t = crossSeedTorrents[key]
    if (t.match !== 'none' && t.match !== 'self') {
      const tf = tFiles[key]
      const fileBlob = tf.file
      const fileName = `[${t.siteKey}].${tf.name}.torrent`
      if (fileBlob)
        saveAs(fileBlob, fileName)
    }
  })
  crossSeedVisible.value = false
}
</script>

<template>
  <div class="search-page-head">
    <a-space class="searching-status">
      <SearchingTag
        v-for="(status, siteKey) in searchStatus"
        :key="siteKey"
        :site-key="siteKey"
        :status="status.status"
        :torrent-counts="status.torrentCounts"
        :is-filter-site="isFilterSite(siteKey)"
        @retry-searching="search(siteKey)"
        @toggle-filter-site="toggleFilterSite(siteKey)"
      />
    </a-space>
  </div>
  <a-table
    :columns="columns"
    :data-source="displayTorrents"
    :pagination="{ pageSize: 100 }"
    class="compact-table"
  >
    <template #title>
      <a-row type="flex" justify="space-between" align="middle">
        <a-col />
        <a-col>
          <a-input-search
            v-model:value="filterText"
            :placeholder="$t('placeholder.filterTorrents')"
            :style="{
              width: '200px',
              border: 'none',
              borderBottom: '1px solid #e9e3e3',
              margin: '0px 12px',
            }"
          />
        </a-col>
      </a-row>
    </template>
    <template #siteTitle>
      {{ $t('tableTitle.site') }}
    </template>
    <template #titleTitle>
      {{ $t('tableTitle.title') }}
    </template>
    <template #sizeTitle>
      {{ $t('tableTitle.size') }}
    </template>
    <template #catagoryTitle>
      {{ $t('tableTitle.catagory') }}
    </template>
    <template #seedersTitle>
      {{ $t('tableTitle.seeders') }}
    </template>
    <template #snatchedTitle>
      {{ $t('tableTitle.snatched') }}
    </template>
    <template #leechersTitle>
      {{ $t('tableTitle.leechers') }}
    </template>
    <template #releaseDateTitle>
      {{ $t('tableTitle.releaseDate') }}
    </template>
    <template #operationTitle>
      {{ $t('tableTitle.operation') }}
    </template>

    <template #site="{ record }">
      <a-space direction="vertical" align="center" :size="1">
        <a-avatar :size="18" :src="sites[record.siteKey].icon.href" />
        <a :href="sites[record.siteKey].url.href" target="_blank">{{ sites[record.siteKey].name }}</a>
      </a-space>
    </template>
    <template #size="{ record }">
      {{ filesize(record.size).human() }}
      <SeedingFilled :color="isSeeding(record) ? 'limegreen' : 'lightgray'" />
    </template>
    <template #torrentTitle="{ record }">
      <a-row type="flex" justify="space-between" align="middle" class="torrent-table-title">
        <a-col class="torrent-titles">
          <a :href="record.detailUrl" target="_blank" class="torrent-title">{{ record.title }}</a>
          <br>
          {{ record.subTitle || '' }}
        </a-col>
        <a-col>
          <PromotionTag
            v-if="record.promotion"
            :status="record.promotion.status"
            :is-temporary="record.promotion.isTemporary"
          />
        </a-col>
      </a-row>
    </template>
    <template #catagory="{ record }">
      {{ $t(`catagory.${record.catagory}`) }}
    </template>
    <template #releaseDate="{ record }">
      <a-tooltip>
        <template #title>
          {{ $dayjs(record.releaseDate).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        {{ $dayjs(record.releaseDate).fromNow() }}
      </a-tooltip>
    </template>
    <template #operation="{ record }">
      <a-space>
        <a-tooltip>
          <template #title>
            {{ $t('icon.download') }}
          </template>
          <a :href="record.downloadUrl">
            <DownloadOutlined />
          </a>
        </a-tooltip>
        <a-tooltip>
          <template #title>
            {{ $t('icon.crossSeed') }}
          </template>
          <CloudUploadOutlined @click="doCrossSeedAnalysis(record)" />
        </a-tooltip>
      </a-space>
    </template>
  </a-table>
  <a-modal
    v-model:visible="crossSeedVisible"
    width="800px"
    :ok-button-props="{ disabled: okButtonDisabled }"
    :ok-text="$t('button.downloadTorrents')"
    @ok="downloadCompatibleTorrents"
  >
    <div v-for="(t, tKey) in crossSeedTorrents" :key="tKey" style="margin-bottom: 8px;">
      <a-space>
        <a-avatar :size="18" :src="sites[t.siteKey].icon.href" />
        <a v-if="t.match !== 'none'" :href="t.url">{{ t.name }}</a>
        <span v-else style="text-decoration:line-through">{{ t.name }}</span>
        <span v-if="t.match === 'self'" />
        <span v-else-if="t.match !== 'none'" :style="{ color: 'green' }">
          {{ $t('siteStatus.matchSucceed') }}
        </span>
        <span v-else :style="{ color: 'red' }">
          {{ $t('siteStatus.matchFailed') }}
        </span>
        <LoadingOutlined v-if="t.status === ESiteStatus.connecting" :style="{ color: 'blue' }" />
        <div v-if="t.status === ESiteStatus.timeout || t.status === ESiteStatus.getTorrentFailed">
          <CloseCircleOutlined :style="{ color: 'red', marginRight: '8px' }" />
          <a @click="retryCrossSeedAnalysis(tKey)">{{ $t('siteStatus.retry') }}</a>
        </div>
      </a-space>
    </div>
  </a-modal>
</template>

<style scoped>
.searching-status {
  width: 100%;
  flex-wrap: wrap;
}
.torrent-title {
  font-weight: bold;
}
.search-page-head {
  margin-bottom: 16px;
}
.torrent-table-title {
  flex-wrap: nowrap;
}
.torrent-titles {
  padding-right: 12px;
}
.torrent-title {
  font-size: 14px;
}
</style>
