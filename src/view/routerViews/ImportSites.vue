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
import { defineComponent } from 'vue'
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

const sitesStatus: SitesStatus = {}
for (const siteKey of Object.keys(sites)) {
  sitesStatus[siteKey] = ESiteStatus.unknow
}

export default defineComponent({
  name: 'importSites',
  components: {
    SiteStatus
  },
  setup () {
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
      // TODO: this.$store is not declared properly, so expose store to other parts of the component
      store,
      columns,
      toggleEnabled
    }
  },
  data () {
    return {
      sitesStatus
    }
  },
  computed: {
    dataSource () {
      const sitesdata: SiteDataProps[] = []
      let key = 1
      for (const siteKey of Object.keys(sites)) {
        const siteData: SiteDataProps = {
          key: key.toString(),
          siteKey,
          siteName: sites[siteKey].name,
          siteUrl: sites[siteKey].url.href,
          siteIcon: sites[siteKey].icon.href,
          siteStatus: this.sitesStatus[siteKey],
          siteEnabled: this.store.state.siteData.enabled.findIndex(s => s === siteKey) !== -1
        }
        key += 1
        sitesdata.push(siteData)
      }
      return sitesdata
    }
  },
  methods: {
    checkSitesStatus () {
      Object.keys(this.sitesStatus).forEach(async siteKey => {
        this.sitesStatus[siteKey] = ESiteStatus.connecting
        const newStatus = await sites[siteKey].checkStatus()
        this.sitesStatus[siteKey] = newStatus
      })
    }
  }
})
</script>
