<template>
  <div class="search-page-head">
    <a-space>
      <a-tag v-for="(status, siteKey) in waitingSites" :key="siteKey" color="gray">
        <div :style="{ display: 'flex', alignItems: 'center' }">
          <img :src="sites[siteKey].icon.href" class="site-icon-tag" />
          {{ sites[siteKey].name }}
        </div>
      </a-tag>
      <a-tag v-for="(status, siteKey) in searchingSites" :key="siteKey" color="blue">
        <div :style="{ display: 'flex', alignItems: 'center' }">
          <img :src="sites[siteKey].icon.href" class="site-icon-tag" />
          {{ sites[siteKey].name }}
        </div>
      </a-tag>
      <a-tag v-for="(status, siteKey) in failedSites" :key="siteKey" color="red">
        <div :style="{ display: 'flex', alignItems: 'center' }">
          <img :src="sites[siteKey].icon.href" class="site-icon-tag" />
          {{ sites[siteKey].name }}
        </div>
      </a-tag>
      <a-tag
        v-for="(status, siteKey) in succeedSites"
        :key="siteKey"
        :color="isFilterSite(siteKey)?'darkgreen':'green'"
        @click="toggleFilterSite(siteKey)"
      >
        <div :style="{ display: 'flex', alignItems: 'center' }">
          <img :src="sites[siteKey].icon.href" class="site-icon-tag" />
          {{ sites[siteKey].name }}
        </div>
      </a-tag>
    </a-space>
  </div>
  <a-table :columns="columns" :dataSource="dataSource" :pagination="{ pageSize: 100 }">
    <template #title>
      <a-row type="flex" justify="space-between" align="middle">
        <a-col></a-col>
        <a-col>
          <a-input-search
            v-model:value="filterText"
            :placeholder="$t('placeholder.filterTorrents')"
            :style="{
              width: '200px',
              border: 'none',
              borderBottom: '1px solid #e9e3e3',
              margin: '0px 12px'
            }"
          />
        </a-col>
      </a-row>
    </template>
    <template #siteTitle>{{ $t('tableTitle.site') }}</template>
    <template #titleTitle>{{ $t('tableTitle.title') }}</template>
    <template #sizeTitle>{{ $t('tableTitle.size') }}</template>
    <template #catagoryTitle>{{ $t('tableTitle.catagory') }}</template>
    <template #seedersTitle>{{ $t('tableTitle.seeders') }}</template>
    <template #snatchedTitle>{{ $t('tableTitle.snatched') }}</template>
    <template #leechersTitle>{{ $t('tableTitle.leechers') }}</template>
    <template #releaseDateTitle>{{ $t('tableTitle.releaseDate') }}</template>
    <template #operationTitle>{{ $t('tableTitle.operation') }}</template>

    <template #site="{ record }">
      <SiteIcon :siteKey="record.siteKey" />
    </template>
    <template #size="{ record }">{{ filesize(record.size).human() }}</template>
    <template #torrentTitle="{ record }">
      <a
        :href="record.detailUrl"
        target="_blank"
        :title="record.title"
        class="torrent-title"
      >{{ record.title }}</a>
      <br />
      {{ record.subTitle || '' }}
    </template>
    <template #catagory="{ record }">{{ $t('catagory.' + record.catagory) }}</template>
    <template #releaseDate="{ record }">
      <a-tooltip>
        <template #title>{{ $dayjs(record.releaseDate).format('YYYY-MM-DD HH:mm:ss') }}</template>
        {{ $dayjs(record.releaseDate).fromNow() }}
      </a-tooltip>
    </template>
  </a-table>
</template>

<script lang="ts">
import { computed, defineComponent, inject, onMounted, reactive, ref, UnwrapRef, watch } from 'vue'
import SiteIcon from '@/components/SIteIcon.vue'
import { ColumnProps } from 'ant-design-vue/es/table/interface'
import { EMutations, useStore } from '@/store'
import { ESiteStatus, Sites, TorrentInfo } from '@/sites'
import PQueue from 'p-queue'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import filesize from 'file-size'

interface TorrentProps extends TorrentInfo {
  key: string,
  siteKey: string
}

interface SearchConfigProps {
  siteKey: string,
  pattern?: string
}

interface SearchStatusProps {
  status: ESiteStatus,
  torrentCounts: number
}

export function genSorter<T = SearchConfigProps> (prop: keyof T) {
  return (a: T, b: T): number => {
    const ap = a[prop]
    const bp = b[prop]
    if (typeof ap === 'string' && typeof bp === 'string') {
      if (ap.toUpperCase() < bp.toUpperCase()) return -1
      if (ap.toUpperCase() > bp.toUpperCase()) return 1
      return 0
    }
    if (typeof ap === 'number' && typeof bp === 'number') return ap - bp
    return 0
  }
}

const columns: ColumnProps[] = [
  {
    key: 'site',
    align: 'center',
    slots: { title: 'siteTitle', customRender: 'site' }
  },
  {
    key: 'torrentTitle',
    ellipsis: true,
    width: '50%',
    slots: { title: 'titleTitle', customRender: 'torrentTitle' }
  },
  {
    key: 'catagory',
    dataIndex: 'catagory',
    align: 'right',
    slots: { title: 'catagoryTitle', customRender: 'catagory' }
  },
  {
    key: 'size',
    align: 'right',
    slots: { title: 'sizeTitle', customRender: 'size' },
    sorter: genSorter('size')
  },
  {
    key: 'seeders',
    dataIndex: 'seeders',
    align: 'right',
    slots: { title: 'seedersTitle' },
    sorter: genSorter('seeders')
  },
  {
    key: 'leechers',
    dataIndex: 'leechers',
    align: 'right',
    slots: { title: 'leechersTitle' },
    sorter: genSorter('leechers')
  },
  {
    key: 'snatched',
    dataIndex: 'snatched',
    align: 'right',
    slots: { title: 'snatchedTitle' },
    sorter: genSorter('snatched')
  },
  {
    key: 'releaseDate',
    align: 'right',
    slots: { title: 'releaseDateTitle', customRender: 'releaseDate' },
    sorter: genSorter('releaseDate')
  },
  {
    key: 'operation',
    slots: { title: 'operationTitle' }
  }
]

export default defineComponent({
  name: 'torrents',
  components: {
    SiteIcon
  },
  setup () {
    const sites = inject('sites') as Sites
    const store = useStore()

    // read settings and params from store
    const searchText = computed(() => store.state.params.searchText)
    const expectTorrents = computed(() => store.state.siteSettings.expectTorrents)
    const enabledSites = computed(() => store.state.siteSettings.enabledSites)
    const selectedConfig = computed(() => store.state.siteSettings.selectedConfig)
    const configList = computed<SearchConfigProps[]>(() => {
      if (selectedConfig.value === 'default') {
        return enabledSites.value.map(siteKey => Object({ siteKey }))
      } else {
        return store.state.siteSettings.searchConfigs.filter(
          config => config.name === selectedConfig.value
        ).filter(
          config => enabledSites.value.some(siteKey => siteKey === config.siteKey)
        ).map(config => Object({ siteKey: config.siteKey, pattern: config.pattern }))
      }
    })
    const activeSites = computed(() => _.uniq(configList.value.map(config => config.siteKey)))
    const filterSite = ref('all')
    const isFilterSite = (siteKey: string) => siteKey === filterSite.value
    const toggleFilterSite = (siteKey: string) => {
      filterSite.value = filterSite.value === siteKey ? 'all' : siteKey
    }
    const filterText = ref('')
    let tList = reactive<TorrentProps[]>([])

    const dataSource = computed(
      () => _.uniqWith(
        tList,
        (t1: TorrentProps, t2: TorrentProps) => t1.siteKey === t2.siteKey && t1.id === t2.id
      ).filter(
        torrent => filterSite.value === 'all' || torrent.siteKey === filterSite.value
      ).filter(
        torrent => !filterText.value || filterText.value.toLowerCase().split(' ').some(word =>
          torrent.title.toLowerCase().indexOf(word) !== -1 ||
          (torrent.subTitle && torrent.subTitle.toLowerCase().indexOf(word) !== -1)
        )
      )
    )

    const searchStatus: UnwrapRef<Record<string, SearchStatusProps>> = reactive({})
    const waitingSites = computed<Record<string, SearchStatusProps>>(() =>
      _.pickBy(searchStatus, v => v.status === ESiteStatus.unknow)
    )
    const searchingSites = computed<Record<string, SearchStatusProps>>(() =>
      _.pickBy(searchStatus, v => v.status === ESiteStatus.connecting)
    )
    const failedSites = computed<Record<string, SearchStatusProps>>(() =>
      _.pickBy(
        searchStatus,
        v => v.status === ESiteStatus.searchFailed || v.status === ESiteStatus.timeout
      )
    )
    const succeedSites = computed<Record<string, SearchStatusProps>>(() =>
      _.pickBy(searchStatus, v => v.status === ESiteStatus.succeed)
    )

    const queue = new PQueue({ concurrency: store.state.siteSettings.concurrencyRequests })
    const search = (siteKey?: string) => {
      const siteList = siteKey ? [siteKey] : activeSites.value
      if (!siteKey) {
        activeSites.value.forEach(siteKey => {
          searchStatus[siteKey] = { status: ESiteStatus.unknow, torrentCounts: NaN }
        })
      }
      siteList.forEach(sKey => {
        searchStatus[sKey].status = ESiteStatus.unknow
        let torrentCounts = 0
        let searchCounts = 0
        const cList = configList.value.filter(config => config.siteKey === sKey)
        cList.forEach(async config => {
          const torrents = await queue.add(() => {
            if (searchStatus[sKey].status === ESiteStatus.unknow) {
              searchStatus[sKey].status = ESiteStatus.connecting
            }
            return sites[sKey].search(searchText.value, expectTorrents.value, config.pattern)
          })
          if (typeof torrents !== 'string') {
            const ts: TorrentProps[] = torrents.map(t => Object({ key: uuidv4(), siteKey: sKey, ...t }))
            torrentCounts += ts.length
            searchCounts += 1
            ts.forEach(t => tList.push(t))
          } else {
            searchStatus[sKey].status = torrents
          }
          if (searchCounts === cList.length) {
            searchStatus[sKey].status = ESiteStatus.succeed
            searchStatus[sKey].torrentCounts = torrentCounts
          }
        })
      })
    }

    onMounted(() => {
      search()
      store.commit(EMutations.setRunSearch, false)
    })

    watch(
      () => store.state.params.runSearch,
      (newRun) => {
        if (newRun) {
          tList = reactive<TorrentProps[]>([])
          search()
          store.commit(EMutations.setRunSearch, false)
        }
      }
    )

    return {
      columns,
      dataSource,
      filesize,
      filterText,
      waitingSites,
      searchingSites,
      failedSites,
      succeedSites,
      sites,
      isFilterSite,
      toggleFilterSite
    }
  }
})
</script>

<style scoped>
.torrent-title {
  font-weight: bold;
}
.site-icon-tag {
  height: 16px;
  width: 16px;
  margin-right: 8px;
}
.search-page-head {
  margin-bottom: 16px;
}
</style>
