<template>
  <a-button @click="checkSiteStatus">Test</a-button>
  <a-table :columns="columns" :data-source="data">
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
      <SiteSwitch :site="record.siteKey" />
    </template>
    <template #status="{ record }">
      <SiteStatus :site="record.siteKey" />
    </template>
  </a-table>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import sites from '@/sites'
import SiteSwitch from '../components/SiteSwitch.vue'
import SiteStatus from '../components/SiteStatus.vue'
import { ColumnProps } from 'ant-design-vue/es/table/interface'
import { store } from '../store'

interface Data {
  key: string,
  siteName: string,
  siteUrl: string,
  siteKey: string
}

export default defineComponent({
  name: 'importSites',
  components: {
    SiteSwitch,
    SiteStatus
  },
  setup () {
    const columns: ColumnProps[] = [
      {
        dataIndex: 'siteName',
        key: 'siteName',
        slots: { title: 'siteTitle' }
      },
      {
        dataIndex: 'siteUrl',
        key: 'siteUrl',
        slots: { title: 'urlTitle', customRender: 'url' }
      },
      {
        key: 'enable',
        slots: { title: 'enableTitle', customRender: 'enable' }
      },
      {
        key: 'status',
        slots: { title: 'statusTitle', customRender: 'status' }
      }
    ]

    const data: Data[] = []
    let dataKey = 1
    for (const siteKey of Object.keys(sites)) {
      data.push({
        key: dataKey.toString(),
        siteName: sites[siteKey].name,
        siteUrl: sites[siteKey].url.href,
        siteKey
      })
      dataKey += 1
    }

    const checkSiteStatus = () => store.dispatch('getSiteStatus')
    return {
      data,
      columns,
      checkSiteStatus
    }
  }
})
</script>
