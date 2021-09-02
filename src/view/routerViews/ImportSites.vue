<template>
  <a-table
    :columns="columns"
    :data-source="data"
  >
   </a-table>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import sites from '@/sites'

interface Data {
  key: string,
  siteName: string,
  siteUrl: string
}

export default defineComponent({
  name: 'importSites',
  setup () {
    const data: Data[] = []
    let dataKey = 1
    for (const siteKey of Object.keys(sites)) {
      data.push({
        key: dataKey.toString(),
        siteName: sites[siteKey].name,
        siteUrl: sites[siteKey].url.href
      })
      dataKey += 1
    }
    return {
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
          key: 'siteUrl'
        }
      ]
    }
  }
})
</script>
