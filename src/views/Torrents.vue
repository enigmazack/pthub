<template>
  <a-table :columns="columns" :dataSource="dataSource" :pagination="{ pageSize: 100 }">
    <template #siteTitle>{{ $t('tableHead.site') }}</template>
    <template #titleTitle>{{ $t('tableHead.title') }}</template>
    <template #sizeTitle>{{ $t('tableHead.size') }}</template>
    <template #catagoryTitle>{{ $t('tableHead.catagoryTitle') }}</template>
    <template #seedersTitle>{{ $t('tableHead.seeders') }}</template>
    <template #snatchedTitle>{{ $t('tableHead.snatched') }}</template>
    <template #leechersTitle>{{ $t('tableHead.leechers') }}</template>
    <template #releaseDateTitle>{{ $t('tableHead.releaseDate') }}</template>
    <template #operationTitle>{{ $t('tableHead.operation') }}</template>

    <template #site="{ record }">
      <SiteIcon :siteKey="record.siteKey" />
    </template>
    <template #size="{ record }">{{ filesize(record.size).human() }}</template>
    <template #torrentTitle="{ record }">
    <a :href="record.detailUrl" target="_blank" :title="record.title">
      {{ record.title }}
    </a>
    </template>
    <template #catagory="{ record }">{{$t('catagory.'+record.catagory)}}</template>
    <template #releaseDate="{ record }">
      <a-tooltip>
        <template #title>{{ $dayjs(record.releaseDate).format('YYYY-MM-DD HH:mm:ss') }}</template>
        {{ $dayjs(record.releaseDate).fromNow() }}
      </a-tooltip>
    </template>
  </a-table>
</template>

<script lang="ts">
import { computed, defineComponent, inject, ref, watch } from 'vue'
import SiteIcon from '@/components/SIteIcon.vue'
import { ColumnProps } from 'ant-design-vue/es/table/interface'
import { EMutations, useStore } from '@/store'
import { Sites, TorrentInfo } from '@/sites'
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

export function genSorter <T = SearchConfigProps> (prop: keyof T) {
  return (a: T, b: T):number => {
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

    const searchText = computed(() => store.state.params.searchText)
    const expectTorrents = computed(() => store.state.siteSettings.expectTorrents)

    const torrentList = ref<TorrentProps[]>([])
    /* const dataSource = computed(() => {
      return _.uniqWith(torrentList.value, (t1:TorrentProps, t2:TorrentProps) =>
        t1.siteKey === t2.siteKey && t1.id === t2.id)
    }) */
    const dataSource = computed(() => torrentList.value)

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

    const queue = new PQueue({ concurrency: store.state.siteSettings.concurrencyRequests })
    const search = (siteKey?: string) => {
      const siteList = siteKey ? [siteKey] : activeSites.value
      siteList.forEach(sKey => {
        const cList = configList.value.filter(config => config.siteKey === sKey)
        cList.forEach(async config => {
          const torrents = await queue.add(() => {
            return sites[sKey].search(searchText.value, expectTorrents.value, config.pattern)
          })
          if (typeof torrents !== 'string') {
            const ts: TorrentProps[] = torrents.map(t => Object({ key: uuidv4(), siteKey: sKey, ...t }))
            ts.forEach(t => torrentList.value.push(t))
          }
        })
      })
      return torrentList
    }

    search()
    store.commit(EMutations.setRunSearch, false)

    watch(
      () => store.state.params.runSearch,
      (newRun) => {
        if (newRun) {
          torrentList.value = []
          search()
          store.commit(EMutations.setRunSearch, false)
        }
      }
    )

    return {
      columns,
      dataSource,
      filesize
    }
  }
})
</script>

<style scoped>
</style>
