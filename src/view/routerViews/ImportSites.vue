<template>
  <a-button @click="checkSitesStatus">Test</a-button>
  <a-table :columns="columns" :dataSource="dataSource">
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
    </template>
  </a-table>
</template>

<script lang="ts">
import { computed, defineComponent, ref, Ref } from 'vue'
import sites, { ESiteStatus } from '@/sites'
import SiteStatus from '../components/SiteStatus.vue'
import { ColumnProps } from 'ant-design-vue/es/table/interface'
import { useStore } from '../store'

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
    const sitesStatus: Ref<SitesStatus> = ref({})
    for (const siteKey of Object.keys(sites)) {
      sitesStatus.value[siteKey] = ESiteStatus.unknow
    }
    const dataSource = computed(() => {
      const sitesdata: SiteDataProps[] = []
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
        sitesdata.push(siteData)
      }
      return sitesdata
    })
    const checkSitesStatus = async () => {
      Object.keys(sitesStatus.value).forEach(async siteKey => {
        sitesStatus.value[siteKey] = ESiteStatus.connecting
        const newStatus = await sites[siteKey].checkStatus()
        sitesStatus.value[siteKey] = newStatus
      })
    }
    // use vuex store
    const store = useStore()
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
    // define the enable switch method
    const toggleEnabled = (siteKey: string) => store.dispatch('toggleEnabledSite', { site: siteKey })

    return {
      dataSource,
      columns,
      toggleEnabled,
      checkSitesStatus
    }
  }
})
</script>
