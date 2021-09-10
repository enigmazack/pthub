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
    <template #uploadData="{ record }">
      {{ filesize(record.uploadData).human() }}
    </template>
    <template #downloadData="{ record }">
      {{ filesize(record.downloadData).human() }}
    </template>
    <template #seedingSize="{ record }">
      {{ filesize(record.seedingSize).human() }}
    </template>
    <template #ratio="{ record }">
      {{ record.ratio.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}
    </template>
    <template #bonus="{ record }">
      {{ record.bonus.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}
    </template>
    <template #joinDate="{ record }">
      <a-tooltip>
        <template #title> {{ dayjs(record.joinDate).format() }} </template>
        {{ dayjs(record.joinDate).fromNow() }}
      </a-tooltip>
    </template>
    <template #recordDate="{ record }">
      <a-tooltip>
        <template #title> {{ dayjs(record.recordDate).format() }} </template>
        {{ dayjs(record.recordDate).fromNow() }}
      </a-tooltip>
    </template>
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
import filesize from 'file-size'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'

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
        slots: { title: 'siteNameTitle' }
      },
      {
        dataIndex: 'userName',
        key: 'userName',
        slots: { title: 'userNameTitle' }
      },
      {
        dataIndex: 'userClass',
        key: 'userClass',
        slots: { title: 'userClassTitle' }
      },
      {
        key: 'uploadData',
        align: 'right',
        slots: { title: 'uploadDataTitle', customRender: 'uploadData' }
      },
      {
        key: 'downloadData',
        align: 'right',
        slots: { title: 'downloadDataTitle', customRender: 'downloadData' }
      },
      {
        key: 'ratio',
        align: 'right',
        slots: { title: 'ratioTitle', customRender: 'ratio' }
      },
      {
        dataIndex: 'seedingCounts',
        key: 'seedingCounts',
        align: 'right',
        slots: { title: 'seedingCountsTitle' }
      },
      {
        key: 'seedingSize',
        align: 'right',
        slots: { title: 'seedingSizeTitle', customRender: 'seedingSize' }
      },
      {
        key: 'bonus',
        align: 'right',
        slots: { title: 'bonusTitle', customRender: 'bonus' }
      },
      {
        key: 'joinDate',
        align: 'right',
        slots: { title: 'joinDateTitle', customRender: 'joinDate' }
      },
      {
        key: 'recordDate',
        align: 'right',
        slots: { title: 'recordDateTitle', customRender: 'recordDate' }
      },
      {
        key: 'status',
        width: 150,
        slots: { title: 'statusTitle', customRender: 'status' }
      }
    ]

    const dataSource = computed(() => {
      const enabledSites = store.state.siteData.enabledSites
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
      const sitesList: string[] = siteKey ? [siteKey] : store.state.siteData.enabledSites
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

    // dayjs setting
    dayjs.locale('zh-cn')
    dayjs.extend(relativeTime)

    return {
      columns,
      dataSource,
      refreshUserData,
      filesize,
      dayjs
    }
  }
})
</script>
