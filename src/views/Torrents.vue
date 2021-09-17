<template>
  <a-table :columns="columns" :dataSource="dataSource" :pagination="{pageSize: 100}">
    <template #siteTitle></template>
  </a-table>
</template>

<script lang="ts">
import { computed, defineComponent, inject, ref, watch } from 'vue'
import { ColumnProps } from 'ant-design-vue/es/table/interface'
import { EMutations, useStore } from '@/store'
import { Sites, TorrentInfo } from '@/sites'
import PQueue from 'p-queue'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'

interface TorrentProps extends TorrentInfo {
  key: string,
  siteKey: string
}

interface SearchConfigProps {
  siteKey: string,
  pattern?: string
}

const columns: ColumnProps[] = [
  {
    key: 'site',
    dataIndex: 'siteKey'
  },
  {
    key: 'title',
    dataIndex: 'title'
  },
  {
    key: 'catagory',
    dataIndex: 'catagory'
  },
  {
    key: 'size',
    dataIndex: 'size'
  },
  {
    key: 'seeders',
    dataIndex: 'seeders'
  },
  {
    key: 'leechers',
    dataIndex: 'leechers'
  },
  {
    key: 'releaseDate',
    dataIndex: 'releaseDate'
  },
  {
    key: 'operation'
  }
]

export default defineComponent({
  name: 'torrents',
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
      dataSource
    }
  }
})
</script>
