<template>
  <a-table :columns="columns" :dataSource="dataSource">
    <template #siteNameTitle> {{ $t('tableHead.site') }} </template>
    <template #userNameTitle> {{ $t('tableHead.site') }} </template>
    <template #userClassTitle> {{ $t('tableHead.site') }} </template>
    <template #uploadDataTitle> {{ $t('tableHead.site') }} </template>
    <template #downloadDataTitle> {{ $t('tableHead.site') }} </template>
    <template #ratioTitle> {{ $t('tableHead.site') }} </template>
    <template #seedingCountsTitle> {{ $t('tableHead.site') }} </template>
    <template #seedingSizeTitle> {{ $t('tableHead.site') }} </template>
    <template #bonusTitle> {{ $t('tableHead.site') }} </template>
    <template #joinDateTitle> {{ $t('tableHead.site') }} </template>
    <template #recordDateTitle> {{ $t('tableHead.site') }} </template>
    <template #statusTitle> {{ $t('tableHead.site') }} </template>
  </a-table>
</template>

<script lang="ts">
import { computed, defineComponent, ref, Ref } from 'vue'
import { ColumnProps } from 'ant-design-vue/es/table/interface'
import { useStore } from '@/store'

export default defineComponent({
  name: 'userData',
  setup () {
    const store = useStore()
    const columns: ColumnProps[] = [
      {
        dataIndex: 'siteName',
        key: 'siteName',
        width: 120,
        slots: { title: 'siteNameTitle' }
      },
      {
        dataIndex: 'userName',
        key: 'userName',
        width: 120,
        slots: { title: 'userNameTitle' }
      },
      {
        dataIndex: 'userClass',
        key: 'userClass',
        width: 120,
        slots: { title: 'userClassTitle' }
      },
      {
        dataIndex: 'uploadData',
        key: 'uploadData',
        width: 120,
        slots: { title: 'uploadDataTitle' }
      },
      {
        dataIndex: 'downloadData',
        key: 'download',
        width: 120,
        slots: { title: 'downloadDataTitle' }
      },
      {
        dataIndex: 'ratio',
        key: 'ratio',
        width: 120,
        slots: { title: 'ratioTitle' }
      },
      {
        dataIndex: 'seedingCounts',
        key: 'seedingCounts',
        width: 120,
        slots: { title: 'seedingCountsTitle' }
      },
      {
        dataIndex: 'seedingSize',
        key: 'seedingSize',
        width: 120,
        slots: { title: 'seedingSizeTitle' }
      },
      {
        dataIndex: 'bonus',
        key: 'bonus',
        width: 120,
        slots: { title: 'bonusTitle' }
      },
      {
        dataIndex: 'joinDate',
        key: 'joinDate',
        width: 120,
        slots: { title: 'joinDateTitle' }
      },
      {
        dataIndex: 'recordDate',
        key: 'recordDate',
        width: 120,
        slots: { title: 'recordDateTitle' }
      },
      {
        key: 'status',
        width: 150,
        slots: { title: 'statusTitle', customRender: 'status' }
      }
    ]
    const dataSource = computed(() => {

    })
    return {
      columns,
      dataSource
    }
  }
})
</script>
