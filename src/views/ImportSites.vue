<template>
  <a-table :columns="columns" :dataSource="dataSource" :pagination="{ pageSize: 100 }">
    <template #title>
      <a-button
        @click="checkSitesStatus()"
        :disabled="buttonDisabled"
        type="primary"
        style="margin: 0px 12px"
      >
        {{ $t('button.checkAll') }}
      </a-button>
      <a-input-search
        v-model:value="searchText"
        :placeholder="$t('placeholder.searchSites')"
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
      {{ $t('tableTitle.site') }}
    </template>
    <template #urlTitle>
      {{ $t('tableTitle.url') }}
    </template>
    <template #enableTitle>
      {{ $t('tableTitle.enable') }}
    </template>
    <template #statusTitle>
      {{ $t('tableTitle.status') }}
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
import { computed, defineComponent, ref, inject, reactive } from 'vue'
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
    const store = useStore()

    const siteList = _.sortBy(Object.keys(sites))
    const searchText = ref('')
    const sitesStatus = reactive<Record<string, ESiteStatus>>({})
    siteList.forEach(siteKey => {
      sitesStatus[siteKey] = ESiteStatus.unknow
    })

    const sitesData = computed<SiteDataProps[]>(
      () => siteList
        .map(siteKey => {
          return {
            key: siteKey,
            siteKey,
            siteName: sites[siteKey].name,
            siteUrl: sites[siteKey].url.href,
            siteIcon: sites[siteKey].icon.href,
            siteStatus: sitesStatus[siteKey],
            siteEnabled: store.getters.isEnabledSite(siteKey)
          }
        })
    )

    const dataSource = computed(
      () => _.sortBy(sitesData.value, ['siteName'])
        .filter(data => !searchText.value ||
          data.siteKey.toLowerCase().indexOf(searchText.value.toLowerCase()) !== -1 ||
          data.siteName.toLowerCase().indexOf(searchText.value.toLowerCase()) !== -1
        )
    )

    // disabled the check all sites button
    const buttonDisabled = ref(false)
    // method to check sites status
    const checkSitesStatus = (siteKey?: string) => {
      // disable the button when checking
      buttonDisabled.value = true
      const sList: string[] = siteKey ? [siteKey] : siteList
      // use p-queue to contral concurrency async functions
      const queue = new PQueue({ concurrency: store.state.siteSettings.concurrencyRequests })
      let counter = 0
      sList.forEach(async siteKey => {
        if (sitesStatus[siteKey] !== ESiteStatus.login) {
          const newStatus = await queue.add(() => {
            sitesStatus[siteKey] = ESiteStatus.connecting
            return sites[siteKey].checkStatus()
          })
          sitesStatus[siteKey] = newStatus
        }
        counter += 1
        if (counter === sList.length) {
          buttonDisabled.value = false
        }
      })
    }

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
      buttonDisabled,
      showRefresh,
      unknow
    }
  }
})
</script>
