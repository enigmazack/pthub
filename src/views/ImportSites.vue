<template>
  <a-table :columns="columns" :dataSource="dataSource">
    <template #title>
      <a-button
        @click="checkSitesStatus()"
        :disabled="disabled"
        type="primary"
        style="margin: 0px 12px"
      >
        {{ $t('button.checkAll') }}
      </a-button>
      <a-input-search
        v-model:value="searchText"
        :placeholder="$t('tableHead.searchSites')"
        :style="{
          width: '200px',
          border: 'none',
          borderBottom: '1px solid #e9e3e3',
          float: 'right',
          margin: '0px 12px'
        }"
      />
    </template>
    <template #siteTitle>
      {{ $t('tableHead.site') }}
    </template>
    <template #urlTitle>
      {{ $t('tableHead.url') }}
    </template>
    <template #enableTitle>
      {{ $t('tableHead.enable') }}
    </template>
    <template #statusTitle>
      {{ $t('tableHead.status') }}
    </template>
    <template #url="{ text }">
      <a :href="text" target="_blank">{{ text }}</a>
    </template>
    <template #enable="{ record }">
      <a-switch @click="toggleEnabled(record.siteKey)" :checked="record.siteEnabled" />
    </template>
    <template #status="{ record }">
      <SiteStatus :status="record.siteStatus" />
      <a
        v-if="showRefresh(record.siteStatus)"
        @click="checkSitesStatus(record.siteKey)"
      >
        {{ record.siteStatus !== unknow ? $t('siteStatus.retry') : $t('siteStatus.check') }}
      </a>
    </template>
  </a-table>
</template>

<script lang="ts">
import { computed, defineComponent, ref, inject, reactive, UnwrapRef } from 'vue'
import { ColumnProps } from 'ant-design-vue/es/table/interface'
import _ from 'lodash'
import { Sites, ESiteStatus } from '@/sites'
import SiteStatus from '@/components/SiteStatus.vue'
import { useStore, EActions } from '@/store'
import PQueue from 'p-queue'

interface SiteDataProps {
  key: string
  siteKey: string,
  siteName: string,
  siteUrl: string,
  siteIcon: string
  siteStatus: ESiteStatus,
  siteEnabled: boolean
}

// define column properties
const columns: ColumnProps[] = [
  {
    dataIndex: 'siteName',
    key: 'siteName',
    width: 150,
    slots: { title: 'siteTitle' }
  },
  {
    dataIndex: 'siteUrl',
    key: 'siteUrl',
    slots: { title: 'urlTitle', customRender: 'url' }
  },
  {
    key: 'enable',
    width: 150,
    slots: { title: 'enableTitle', customRender: 'enable' },
    sorter: (a: SiteDataProps, b: SiteDataProps) => {
      if (a.siteEnabled < b.siteEnabled) {
        return -1
      }
      if (a.siteEnabled > b.siteEnabled) {
        return 1
      }
      return 0
    }
  },
  {
    key: 'status',
    width: 150,
    slots: { title: 'statusTitle', customRender: 'status' }
  }
]

export default defineComponent({
  name: 'importSites',
  components: {
    SiteStatus
  },
  setup () {
    const sites = inject('sites') as Sites
    const searchText = ref('')
    // use vuex store
    const store = useStore()
    // set all sites status init value unknow
    const sitesStatus: UnwrapRef<Record<string, ESiteStatus>> = reactive({})
    for (const siteKey of Object.keys(sites)) {
      sitesStatus[siteKey] = ESiteStatus.unknow
    }
    // table data source is a computed props
    const dataSource = computed(() => {
      const sitesData: SiteDataProps[] = []
      let key = 1
      for (const siteKey of Object.keys(sites)) {
        const siteData: SiteDataProps = {
          key: key.toString(),
          siteKey,
          siteName: sites[siteKey].name,
          siteUrl: sites[siteKey].url.href,
          siteIcon: sites[siteKey].icon.href,
          siteStatus: sitesStatus[siteKey],
          siteEnabled: store.state.siteSettings.enabledSites.findIndex(s => s === siteKey) !== -1
        }
        key += 1
        sitesData.push(siteData)
      }
      const sortedSitesData = _.sortBy(sitesData, ['siteName'])
      if (searchText.value === '') {
        return sortedSitesData
      }
      // TODO: maybe we want to do some fuzzy search here
      return sortedSitesData.filter(data =>
        data.siteKey.toLowerCase().indexOf(searchText.value.toLowerCase()) !== -1 ||
        data.siteName.toLowerCase().indexOf(searchText.value.toLowerCase()) !== -1
      )
    })

    // disabled the check all sites button
    const disabled = ref(false)
    // method to check sites status
    const checkSitesStatus = (siteKey?: string) => {
      // disable the button when checking
      disabled.value = true
      const sitesList: string[] = siteKey ? [siteKey] : Object.keys(sites)
      // use p-queue to contral concurrency async functions
      const queue = new PQueue({ concurrency: store.state.siteSettings.concurrencyRequests })
      let counter = 0
      sitesList.forEach(async siteKey => {
        if (sitesStatus[siteKey] !== ESiteStatus.login) {
          const newStatus = await queue.add(() => {
            sitesStatus[siteKey] = ESiteStatus.connecting
            return sites[siteKey].checkStatus()
          })
          sitesStatus[siteKey] = newStatus
        }
        counter += 1
        if (counter === sitesList.length) {
          disabled.value = false
        }
      })
    }
    // method to toggle site, it's a dispatch of the store
    const toggleEnabled = (siteKey: string) => store.dispatch(EActions.toggleEnabledSite, { site: siteKey })

    const showRefresh = (siteStatus: ESiteStatus) =>
      siteStatus !== ESiteStatus.login && siteStatus !== ESiteStatus.connecting
    const unknow = ESiteStatus.unknow

    return {
      searchText,
      dataSource,
      columns,
      toggleEnabled,
      checkSitesStatus,
      disabled,
      showRefresh,
      unknow
    }
  }
})
</script>
