<script lang="ts" setup>
import _ from 'lodash'
import filesize from 'file-size'
import PQueue from 'p-queue'
import { EActions, useStore } from '~/store'
import type { UserData } from '~/store/modules/userData/state'
import type { Sites } from '~/sites'
import { ESiteStatus } from '~/sites'

interface UserDataProps {
  key: string
  siteKey: string
  siteName: string
  siteUrl: string
  siteIcon: string
  userName: string
  userClass: string
  uploadData: number
  downloadData: number
  ratio: number
  seedingCounts: number
  seedingSize: number
  bonus: number
  joinDate: number
  recordDate: number
  status: ESiteStatus
}

// quick gen sort compare function
const genSorter = (prop: keyof UserDataProps) =>
  (a: UserDataProps, b: UserDataProps) => {
    const ap = a[prop]
    const bp = b[prop]
    if (typeof ap === 'string' && typeof bp === 'string') {
      if (ap.toUpperCase() < bp.toUpperCase())
        return -1
      if (ap.toUpperCase() > bp.toUpperCase())
        return 1
      return 0
    }
    if (typeof ap === 'number' && typeof bp === 'number')
      return ap - bp
    return 0
  }

const columns = [
  {
    key: 'site',
    align: 'center',
    slots: { title: 'siteNameTitle', customRender: 'site' },
    sorter: genSorter('siteName'),
  },
  {
    dataIndex: 'userName',
    key: 'userName',
    slots: { title: 'userNameTitle' },
    sorter: genSorter('userName'),
  },
  {
    dataIndex: 'userClass',
    key: 'userClass',
    slots: { title: 'userClassTitle' },
  },
  {
    key: 'uploadData',
    align: 'right',
    slots: { title: 'uploadDataTitle', customRender: 'uploadData' },
    sorter: genSorter('uploadData'),
  },
  {
    key: 'downloadData',
    align: 'right',
    slots: { title: 'downloadDataTitle', customRender: 'downloadData' },
    sorter: genSorter('downloadData'),
  },
  {
    key: 'ratio',
    align: 'right',
    slots: { title: 'ratioTitle', customRender: 'ratio' },
    sorter: genSorter('ratio'),
  },
  {
    dataIndex: 'seedingCounts',
    key: 'seedingCounts',
    align: 'right',
    slots: { title: 'seedingCountsTitle' },
    sorter: genSorter('seedingCounts'),
  },
  {
    key: 'seedingSize',
    align: 'right',
    slots: { title: 'seedingSizeTitle', customRender: 'seedingSize' },
    sorter: genSorter('seedingSize'),
  },
  {
    key: 'bonus',
    align: 'right',
    slots: { title: 'bonusTitle', customRender: 'bonus' },
    sorter: genSorter('bonus'),
  },
  {
    key: 'joinDate',
    align: 'right',
    slots: { title: 'joinDateTitle', customRender: 'joinDate' },
    sorter: genSorter('joinDate'),
  },
  {
    key: 'recordDate',
    align: 'right',
    slots: { title: 'recordDateTitle', customRender: 'recordDate' },
    sorter: genSorter('recordDate'),
  },
  {
    key: 'status',
    width: 120,
    align: 'center',
    slots: { title: 'statusTitle', customRender: 'status' },
  },
]

const sites = inject('sites') as Sites
const store = useStore()

const sitesStatus = reactive<Record<string, ESiteStatus>>({})
for (const siteKey of Object.keys(sites))
  sitesStatus[siteKey] = ESiteStatus.empty

const enabledSites = computed(() => store.state.siteSettings.enabledSites)

const userData = computed(
  () => enabledSites.value.map<UserDataProps>(
    (siteKey) => {
      const uData = store.getters.getUserData(siteKey)
      const site = sites[siteKey]
      return {
        key: siteKey,
        siteKey,
        siteName: site.name,
        siteUrl: site.url.href,
        siteIcon: site.icon.href,
        userName: uData ? uData.name : '',
        userClass: uData ? uData.userClass : '',
        uploadData: uData ? uData.upload : NaN,
        downloadData: uData ? uData.download : NaN,
        ratio: uData ? (uData.upload / uData.download > 1e6 ? Infinity : uData.upload / uData.download) : NaN,
        seedingCounts: uData ? uData.seeding : NaN,
        seedingSize: uData ? uData.seedingSize : NaN,
        bonus: uData && uData.bonus !== -1 ? uData.bonus : NaN,
        joinDate: uData ? uData.joinDate : 0,
        recordDate: uData ? uData.recordDate : NaN,
        status: sitesStatus[siteKey],
      }
    },
  ),
)

const searchText = ref('')
const dataSource = computed(
  () => _.sortBy(userData.value, ['siteName'])
    .filter(
      uData => !searchText.value
            || uData.siteKey.toLowerCase().includes(searchText.value.toLowerCase())
            || uData.siteName.toLowerCase().includes(searchText.value.toLowerCase()),
    ),
)

const disabled = ref(false)
const refreshUserData = (siteKey?: string) => {
  disabled.value = true
  const sitesList: string[] = siteKey ? [siteKey] : enabledSites.value
  const queue = new PQueue({ concurrency: store.state.siteSettings.concurrencyRequests })
  let counter = 0
  sitesList.forEach(async (sKey) => {
    const uData = await queue.add(() => {
      sitesStatus[sKey] = ESiteStatus.connecting
      return sites[sKey].getUserInfo()
    })
    if (typeof uData === 'string') {
      sitesStatus[sKey] = uData
    }
    else {
      const recordDate = Date.now()
      const data: UserData = {
        siteKey: sKey,
        recordDate,
        ...uData,
      }
      await store.dispatch(EActions.updateUserData, { data })
      sitesStatus[sKey] = ESiteStatus.succeed
    }
    counter += 1
    if (counter === sitesList.length)
      disabled.value = false
  })
}
</script>

<template>
  <a-table
    id="userdata-table"
    :columns="columns"
    :data-source="dataSource"
    class="compact-table"
    :pagination="{ pageSize: 100 }"
  >
    <template #title>
      <a-row type="flex" justify="space-between" align="middle">
        <a-col>
          <a-button
            :disabled="disabled"
            type="primary"
            style="margin: 0px 12px"
            @click="refreshUserData()"
          >
            {{ $t('button.refreshAll') }}
          </a-button>
        </a-col>
        <a-col>
          <a-input-search
            v-model:value="searchText"
            :placeholder="$t('placeholder.searchSites')"
            :style="{
              width: '200px',
              border: 'none',
              borderBottom: '1px solid #e9e3e3',
              margin: '0px 12px',
            }"
          />
        </a-col>
      </a-row>
    </template>
    <template #siteNameTitle>
      {{ $t('tableTitle.site') }}
    </template>
    <template #userNameTitle>
      {{ $t('tableTitle.userName') }}
    </template>
    <template #userClassTitle>
      {{ $t('tableTitle.userClass') }}
    </template>
    <template #uploadDataTitle>
      {{ $t('tableTitle.uploadData') }}
    </template>
    <template #downloadDataTitle>
      {{ $t('tableTitle.downloadData') }}
    </template>
    <template #ratioTitle>
      {{ $t('tableTitle.ratio') }}
    </template>
    <template #seedingCountsTitle>
      {{ $t('tableTitle.seedingCounts') }}
    </template>
    <template #seedingSizeTitle>
      {{ $t('tableTitle.seedingSize') }}
    </template>
    <template #bonusTitle>
      {{ $t('tableTitle.bonus') }}
    </template>
    <template #joinDateTitle>
      {{ $t('tableTitle.joinDate') }}
    </template>
    <template #recordDateTitle>
      {{ $t('tableTitle.recordDate') }}
    </template>
    <template #statusTitle>
      {{ $t('tableTitle.status') }}
    </template>
    <template #site="{ record }">
      <a-tooltip>
        <template #title>
          {{ $t('button.refreshUserData') }}
        </template>
        <a-button
          :disabled="disabled"
          shape="circle"
          class="site-button"
          @click="refreshUserData(record.siteKey)"
        >
          <a-avatar :size="18" :src="record.siteIcon" />
        </a-button>
      </a-tooltip>
      <br>
      <a-tooltip placement="bottom">
        <template #title>
          {{ $t('button.vistSite') }}
        </template>
        <a
          :href="record.siteUrl"
          target="_blank"
        >{{ record.siteName }}</a>
      </a-tooltip>
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
    <template
      #ratio="{ record }"
    >
      {{ record.ratio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
    </template>
    <template
      #bonus="{ record }"
    >
      {{ record.bonus.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
    </template>
    <template #joinDate="{ record }">
      <a-tooltip>
        <template #title>
          {{ $dayjs(record.joinDate).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        {{ $dayjs(record.joinDate).fromNow() }}
      </a-tooltip>
    </template>
    <template #recordDate="{ record }">
      <a-tooltip>
        <template #title>
          {{ $dayjs(record.recordDate).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        {{ $dayjs(record.recordDate).fromNow() }}
      </a-tooltip>
    </template>
    <template #status="{ record }">
      <SiteStatus :status="record.status" />
    </template>
  </a-table>
</template>

<style scoped>
button.site-button {
  border: 0;
}
button.site-button:hover {
  border: 0;
  background-color: lightgray;
}
#userdata-table .site-status {
  margin-left: 20px;
}
</style>
