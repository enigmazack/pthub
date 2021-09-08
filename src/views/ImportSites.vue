<template>
  <a-table :columns="columns" :dataSource="dataSource">
    <template #title>
      <a-button
        @click="checkSitesStatus()"
        :disabled="disabled"
        type="primary"
        style="margin: 0px 12px"
      >
        {{ $t('siteStatus.checkAll') }}
      </a-button>
      <a-input-search
        v-model:value="searchText"
        :placeholder="$t('tableHead.searchSites')"
        style="width: 200px"
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
import { computed, defineComponent, ref, Ref } from 'vue'
import { ColumnProps } from 'ant-design-vue/es/table/interface'
import _ from 'lodash'
import sites, { ESiteStatus } from '@/sites'
import SiteStatus from '@/components/SiteStatus.vue'
import { useStore } from '@/store'
import { EActions } from '@/store/enum'

interface SiteDataProps {
  key: string
  siteKey: string,
  siteName: string,
  siteUrl: string,
  siteIcon: string
  siteStatus: ESiteStatus,
  siteEnabled: boolean
}

interface SitesStatus {
  [key: string]: ESiteStatus
}

export default defineComponent({
  name: 'importSites',
  components: {
    SiteStatus
  },
  setup () {
    const searchText = ref('')
    // use vuex store
    const store = useStore()
    // set all sites status init value unknow
    const sitesStatus: Ref<SitesStatus> = ref({})
    for (const siteKey of Object.keys(sites)) {
      sitesStatus.value[siteKey] = ESiteStatus.unknow
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
          siteStatus: sitesStatus.value[siteKey],
          siteEnabled: store.state.siteData.enabled.findIndex(s => s === siteKey) !== -1
        }
        key += 1
        sitesData.push(siteData)
      }
      if (searchText.value === '') {
        return sitesData
      }
      // TODO: maybe we want to do some fuzzy search here
      return _.filter(sitesData, data =>
        data.siteKey.toLowerCase().indexOf(searchText.value.toLowerCase()) !== -1 ||
        data.siteName.toLowerCase().indexOf(searchText.value.toLowerCase()) !== -1
      )
    })
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
        slots: { title: 'enableTitle', customRender: 'enable' }
      },
      {
        key: 'status',
        width: 150,
        slots: { title: 'statusTitle', customRender: 'status' }
      }
    ]
    // disabled the check all sites button
    const disabled = ref(false)
    // method to check sites status
    const checkSitesStatus = (siteKey?: string) => {
      disabled.value = true
      // use forEach all sites status check will run asynchronously
      let counter = 0
      const sitesList: string[] = siteKey ? [siteKey] : Object.keys(sitesStatus.value)
      sitesList.forEach(async siteKey => {
        if (sitesStatus.value[siteKey] !== ESiteStatus.login) {
          sitesStatus.value[siteKey] = ESiteStatus.connecting
          const newStatus = await sites[siteKey].checkStatus()
          sitesStatus.value[siteKey] = newStatus
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

<style>
span.ant-input-affix-wrapper {
  border: none;
  border-bottom: 1px solid #e9e3e3;
  float: right;
  margin: 0px 12px
}
</style>
