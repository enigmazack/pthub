<template>
  <a-table :columns="columns" :dataSource="dataSource">
    <template #siteNameTitle> {{ $t('tableHead.site') }} </template>
    <template #userNameTitle> {{ $t('tableHead.userName') }} </template>
    <template #userClassTitle> {{ $t('tableHead.userClass') }} </template>
    <template #uploadDataTitle> {{ $t('tableHead.uploadData') }} </template>
    <template #downloadDataTitle> {{ $t('tableHead.downloadData') }} </template>
    <template #ratioTitle> {{ $t('tableHead.ratio') }} </template>
    <template #seedingCountsTitle> {{ $t('tableHead.seedingCounts') }} </template>
    <template #seedingSizeTitle> {{ $t('tableHead.seedingSize') }} </template>
    <template #bonusTitle> {{ $t('tableHead.bonus') }} </template>
    <template #joinDateTitle> {{ $t('tableHead.joinDate') }} </template>
    <template #recordDateTitle> {{ $t('tableHead.recordDate') }} </template>
    <template #statusTitle> {{ $t('tableHead.status') }} </template>
  </a-table>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { ColumnProps } from 'ant-design-vue/es/table/interface'
// import { useStore } from '@/store'
import { ESiteStatus } from '@/sites'

interface userDataProps {
  siteName: string,
  userName: string,
  userClass: string,
  uploadData: number,
  downloadData: number,
  ratio: number,
  seedingCounts: number,
  seedingSize: number,
  bonus: number,
  joinDate: number,
  recordDate: number,
  status: ESiteStatus
}

export default defineComponent({
  name: 'userData',
  setup () {
    // const store = useStore()
    const columns: ColumnProps[] = [
      {
        dataIndex: 'siteName',
        key: 'siteName',
        width: 100,
        slots: { title: 'siteNameTitle' }
      },
      {
        dataIndex: 'userName',
        key: 'userName',
        width: 100,
        slots: { title: 'userNameTitle' }
      },
      {
        dataIndex: 'userClass',
        key: 'userClass',
        // width: 100,
        slots: { title: 'userClassTitle' }
      },
      {
        dataIndex: 'uploadData',
        key: 'uploadData',
        width: 100,
        slots: { title: 'uploadDataTitle' }
      },
      {
        dataIndex: 'downloadData',
        key: 'download',
        width: 100,
        slots: { title: 'downloadDataTitle' }
      },
      {
        dataIndex: 'ratio',
        key: 'ratio',
        width: 100,
        slots: { title: 'ratioTitle' }
      },
      {
        dataIndex: 'seedingCounts',
        key: 'seedingCounts',
        width: 100,
        slots: { title: 'seedingCountsTitle' }
      },
      {
        dataIndex: 'seedingSize',
        key: 'seedingSize',
        width: 100,
        slots: { title: 'seedingSizeTitle' }
      },
      {
        dataIndex: 'bonus',
        key: 'bonus',
        width: 100,
        slots: { title: 'bonusTitle' }
      },
      {
        dataIndex: 'joinDate',
        key: 'joinDate',
        width: 100,
        slots: { title: 'joinDateTitle' }
      },
      {
        dataIndex: 'recordDate',
        key: 'recordDate',
        width: 100,
        slots: { title: 'recordDateTitle' }
      },
      {
        key: 'status',
        width: 150,
        slots: { title: 'statusTitle', customRender: 'status' }
      }
    ]
    const dataSource = computed(() => {
      const userData: userDataProps[] = []
      return userData
    })
    return {
      columns,
      dataSource
    }
  }
})
</script>
