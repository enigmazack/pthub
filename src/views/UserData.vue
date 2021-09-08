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
    <template #status="{ record }">
      <SiteStatus :status="record.status" />
      <a @click="refreshUserData(record.siteKey)">
        {{ $t('siteStatus.refresh') }}
      </a>
    </template>
  </a-table>
</template>

<script lang="ts">
import { computed, defineComponent, ref, Ref } from 'vue'
import { ColumnProps } from 'ant-design-vue/es/table/interface'
import { useStore } from '@/store'
import { UserData } from '@/store/modules/siteData'
import sites, { ESiteStatus } from '@/sites'
import _ from 'lodash'
import SiteStatus from '@/components/SiteStatus.vue'
import { EActions } from '@/store/enum'

interface userDataProps {
  key: string,
  siteKey: string,
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

interface SitesStatus {
  [key: string]: ESiteStatus
}

export default defineComponent({
  name: 'userData',
  components: {
    SiteStatus
  },
  setup () {
    const store = useStore()
    const sitesStatus: Ref<SitesStatus> = ref({})
    for (const siteKey of Object.keys(sites)) {
      sitesStatus.value[siteKey] = ESiteStatus.unknow
    }
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
      const enabledSites = store.state.siteData.enabled
      const storeData = store.state.siteData.userData
      const userData: userDataProps[] = []
      let counter = 1
      enabledSites.forEach(siteKey => {
        if (sites[siteKey]) {
          const uData = _.find(storeData, d => d.siteKey === siteKey)
          const site = sites[siteKey]
          const data: userDataProps = {
            key: counter.toString(),
            siteKey,
            siteName: site.name,
            userName: uData ? uData.name : '',
            userClass: uData && uData.userClass ? uData.userClass : '',
            uploadData: uData && uData.upload ? uData.upload : NaN,
            downloadData: uData && uData.download ? uData.download : NaN,
            ratio: uData && uData.ratio ? uData.ratio : NaN,
            seedingCounts: uData && uData.seeding ? uData.seeding : NaN,
            seedingSize: uData && uData.seedingSize ? uData.seedingSize : NaN,
            bonus: uData && uData.bonus ? uData.bonus : NaN,
            joinDate: uData && uData.joinDate ? uData.joinDate : NaN,
            recordDate: uData ? uData.recordDate : NaN,
            status: sitesStatus.value[siteKey]
          }
          userData.push(data)
          counter += 1
        }
      })
      return userData
    })

    const disabled = ref(false)
    const refreshUserData = (siteKey?: string) => {
      disabled.value = true
      let counter = 0
      const sitesList: string[] = siteKey ? [siteKey] : store.state.siteData.enabled
      sitesList.forEach(async sKey => {
        sitesStatus.value[sKey] = ESiteStatus.connecting
        const uData = await sites[sKey].getUserInfo()
        if (typeof uData === 'string') {
          // TODO: more getUserInfo() retruns of ESiteStatus
          sitesStatus.value[sKey] = ESiteStatus.timeout
        } else {
          const recordDate = Date.now()
          const data: UserData = {
            siteKey: sKey,
            recordDate,
            ...uData
          }
          await store.dispatch(EActions.updateUserData, { data })
          sitesStatus.value[sKey] = ESiteStatus.login
        }
        counter += 1
        if (counter === sitesList.length) {
          disabled.value = false
        }
      })
    }
    return {
      columns,
      dataSource,
      refreshUserData
    }
  }
})
</script>
