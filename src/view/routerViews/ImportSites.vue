<template>
  <a-table :columns="columns" :data-source="data">
    <template #url="{ text }">
      <a v-bind:href="text" target="_blank">{{ text }}</a>
    </template>
    <template #enable="{ record }">
      <SiteSwitch v-bind:site="record.siteKey"/>
    </template>
  </a-table>
  <div>Test hdchina: {{test}}</div>
  <div><SiteSwitch v-bind:site="testSite"/></div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import sites from '@/sites'
import { useStore } from '../store'
import SiteSwitch from '../components/SiteSwitch.vue'

interface Data {
  key: string,
  siteName: string,
  siteUrl: string,
  siteKey: string
}

export default defineComponent({
  name: 'importSites',
  components: {
    SiteSwitch
  },
  setup () {
    const testSite = 'hdchina'
    const store = useStore()
    const test = computed(() => {
      const enabled = store.state.siteData.enabled.findIndex(s => s === 'hdchina') !== -1
      return enabled ? 'True' : 'False'
    })
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

    return {
      testSite,
      test,
      data,
      columns: [
        {
          title: '站点',
          dataIndex: 'siteName',
          key: 'siteName'
        },
        {
          title: '地址',
          dataIndex: 'siteUrl',
          key: 'siteUrl',
          slots: { customRender: 'url' }
        },
        {
          title: '启用',
          key: 'enable',
          slots: { customRender: 'enable' }
        }
      ]
    }
  }
})
</script>
