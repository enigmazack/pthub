<template>
  <a-table :columns="columns" :dataSource="dataSource"></a-table>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { ColumnProps } from 'ant-design-vue/es/table/interface'

const columns: ColumnProps[] = [
  {
    key: 'site'
  },
  {
    key: 'title'
  },
  {
    key: 'catagory'
  },
  {
    key: 'size'
  },
  {
    key: 'seeders'
  },
  {
    key: 'leechers'
  }
]

export default defineComponent({
  name: 'search',
  setup () {
    const dataSource = computed(() => { return [] })
    return {
      columns,
      dataSource
    }
  }
})
</script>
