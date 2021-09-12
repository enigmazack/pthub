<template>
  <a-table :columns="columns" :dataSource="dataSource">
    <template #title>
      <a-button
        @click="refreshUserData()"
        :disabled="disabled"
        type="primary"
        style="margin: 0px 12px"
      >
        {{ $t('button.refreshAll') }}
      </a-button>
      <a-input-search
        v-model:value="searchText"
        :placeholder="$t('tableHead.searchSites')"
        style="width: 200px"
      />
    </template>
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
    <template #site="{ record }">
      <a-button
        @click="refreshUserData(record.siteKey)"
        :disabled="disabled"
        shape="circle"
        class="site-button"
      >
        <a-avatar
          size="small"
          :src="record.siteIcon"
        />
      </a-button>
      <br />
      <a :href="record.siteUrl" target="_blank" :style="{ fontSize: '12px' }">
        {{ record.siteName }}
      </a>
    </template>
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
        <template #title> {{ $dayjs(record.joinDate).format('YYYY-MM-DD HH:mm:ss') }} </template>
        {{ $dayjs(record.joinDate).fromNow() }}
      </a-tooltip>
    </template>
    <template #recordDate="{ record }">
      <a-tooltip>
        <template #title> {{ $dayjs(record.recordDate).format('YYYY-MM-DD HH:mm:ss') }} </template>
        {{ $dayjs(record.recordDate).fromNow() }}
      </a-tooltip>
    </template>
    <template #status="{ record }">
      <SiteStatus :status="record.status" />
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
import PQueue from 'p-queue'

interface UserDataProps {
  key: string,
  siteKey: string,
  siteName: string,
  siteUrl: string,
  siteIcon: string,
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

const genSorter = (prop: keyof UserDataProps) =>
  (a: UserDataProps, b: UserDataProps) => {
    const ap = a[prop]
    const bp = b[prop]
    if (typeof ap === 'string' && typeof bp === 'string') {
      if (ap.toUpperCase() < bp.toUpperCase()) return -1
      if (a.userName.toUpperCase() > b.userName.toUpperCase()) return 1
      return 0
    }
    if (typeof ap === 'number' && typeof bp === 'number') return ap - bp
    return 0
  }

const columns: ColumnProps[] = [
  {
    key: 'site',
    align: 'center',
    slots: { title: 'siteNameTitle', customRender: 'site' },
    sorter: genSorter('siteName')
  },
  {
    dataIndex: 'userName',
    key: 'userName',
    slots: { title: 'userNameTitle' },
    sorter: genSorter('userName')
  },
  {
    dataIndex: 'userClass',
    key: 'userClass',
    slots: { title: 'userClassTitle' }
  },
  {
    key: 'uploadData',
    align: 'right',
    slots: { title: 'uploadDataTitle', customRender: 'uploadData' },
    sorter: genSorter('uploadData')
  },
  {
    key: 'downloadData',
    align: 'right',
    slots: { title: 'downloadDataTitle', customRender: 'downloadData' },
    sorter: genSorter('downloadData')
  },
  {
    key: 'ratio',
    align: 'right',
    slots: { title: 'ratioTitle', customRender: 'ratio' },
    sorter: genSorter('ratio')
  },
  {
    dataIndex: 'seedingCounts',
    key: 'seedingCounts',
    align: 'right',
    slots: { title: 'seedingCountsTitle' },
    sorter: genSorter('seedingCounts')
  },
  {
    key: 'seedingSize',
    align: 'right',
    slots: { title: 'seedingSizeTitle', customRender: 'seedingSize' },
    sorter: genSorter('seedingSize')
  },
  {
    key: 'bonus',
    align: 'right',
    slots: { title: 'bonusTitle', customRender: 'bonus' },
    sorter: genSorter('bonus')
  },
  {
    key: 'joinDate',
    align: 'right',
    slots: { title: 'joinDateTitle', customRender: 'joinDate' },
    sorter: genSorter('joinDate')
  },
  {
    key: 'recordDate',
    align: 'right',
    slots: { title: 'recordDateTitle', customRender: 'recordDate' },
    sorter: genSorter('recordDate')
  },
  {
    key: 'status',
    width: 150,
    slots: { title: 'statusTitle', customRender: 'status' }
  }
]

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

    const searchText = ref('')
    const dataSource = computed(() => {
      const enabledSites = store.state.siteData.enabledSites
      const storeData = store.state.siteData.userData
      const userData: UserDataProps[] = []
      let counter = 1
      enabledSites.forEach(siteKey => {
        if (sites[siteKey]) {
          const uData = _.find(storeData, d => d.siteKey === siteKey)
          const site = sites[siteKey]
          const data: UserDataProps = {
            key: counter.toString(),
            siteKey,
            siteName: site.name,
            siteUrl: site.url.href,
            siteIcon: site.icon.href,
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
      const sorteduserData = _.sortBy(userData, ['siteName'])
      if (searchText.value === '') {
        return sorteduserData
      }
      return _.filter(sorteduserData, data =>
        data.siteKey.toLowerCase().indexOf(searchText.value.toLowerCase()) !== -1 ||
        data.siteName.toLowerCase().indexOf(searchText.value.toLowerCase()) !== -1
      )
    })

    const disabled = ref(false)
    const refreshUserData = (siteKey?: string) => {
      disabled.value = true
      const sitesList: string[] = siteKey ? [siteKey] : store.state.siteData.enabledSites
      const queue = new PQueue({ concurrency: store.state.uiSettings.concurrencyRequests || 5 })
      let counter = 0
      sitesList.forEach(async sKey => {
        const uData = await queue.add(() => {
          sitesStatus.value[sKey] = ESiteStatus.connecting
          return sites[sKey].getUserInfo()
        })
        if (typeof uData === 'string') {
          sitesStatus.value[sKey] = uData
        } else {
          const recordDate = Date.now()
          const data: UserData = {
            siteKey: sKey,
            recordDate,
            ...uData
          }
          await store.dispatch(EActions.updateUserData, { data })
          sitesStatus.value[sKey] = ESiteStatus.succeed
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
      refreshUserData,
      filesize,
      disabled,
      searchText
    }
  }
})
</script>

<style>
span.ant-input-affix-wrapper {
  border: none;
  border-bottom: 1px solid #e9e3e3;
  float: right;
  margin: 0px 12px
}
button.site-button {
  border: 0;
}
button.site-button:hover {
  border: 0;
  background-color: lightgray;
}
</style>
