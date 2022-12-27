<script lang="ts" setup>
import _ from 'lodash'
import type { Sites } from '~/sites'
import { EActions, useStore } from '~/store'

const store = useStore()
const sites = inject('sites') as Sites
const enabledSites = computed(() => _.sortBy(store.state.siteSettings.enabledSites))
const showSites = ref(enabledSites.value)

const searchText = ref('')
const activeKey = ref(['global'])
watch(
  () => searchText.value,
  (newText) => {
    if (newText !== '') {
      const activeList = enabledSites.value.filter(siteKey =>
        siteKey.toLowerCase().includes(searchText.value.toLowerCase())
            || sites[siteKey].name.toLowerCase().includes(searchText.value.toLowerCase()))
      if (activeList.length === 1)
        activeKey.value = ['global'].concat(activeList)
      else
        activeKey.value = ['global']

      showSites.value = activeList
    }
    else {
      activeKey.value = ['global']
      showSites.value = enabledSites.value
    }
  },
)

const concurrencyRequests = ref(store.state.siteSettings.concurrencyRequests)
watch(
  () => concurrencyRequests.value,
  (newNumber) => {
    store.dispatch(EActions.setConcurrencyRequests, { number: newNumber })
  },
)

const expectTorrents = ref(store.state.siteSettings.expectTorrents)
watch(
  () => expectTorrents.value,
  (newNumber) => {
    store.dispatch(EActions.setExpectTorrents, { number: newNumber })
  },
)

const timeout = ref(store.state.siteSettings.timeout)
watch(
  () => timeout.value,
  (newNumber) => {
    store.dispatch(EActions.setTimeout, { timeout: newNumber })
  },
)
</script>

<template>
  <div
    :style="{
      padding: '15px 0px',
      background: 'white',
    }"
  >
    <a-input-search
      v-model:value="searchText"
      :placeholder="$t('placeholder.searchSites')"
      :style="{
        width: '200px',
        border: 'none',
        borderBottom: '1px solid #e9e3e3',
        margin: '0px 0px',
      }"
    />
  </div>
  <a-collapse
    v-model:activeKey="activeKey"
    :style="{
      borderLeftWidth: '0px',
      borderRightWidth: '0px',
    }"
  >
    <a-collapse-panel key="global" :header="$t('settings.globalSettings')">
      <a-space direction="horizontal" :size="100">
        <div>
          <a-tooltip>
            <template #title>
              {{ $t('settings.concurrencyRequestsTip') }}
            </template>
            {{ `${$t('settings.concurrencyRequests')}:` }}
          </a-tooltip>
          <a-input-number
            id="concurrencyRequests"
            v-model:value="concurrencyRequests"
            :min="1"
            :max="10"
            size="small"
          />
        </div>
        <div>
          <a-tooltip>
            <template #title>
              {{ $t('settings.expectTorrentsTip') }}
            </template>
            {{ `${$t('settings.expectTorrents')}:` }}
          </a-tooltip>
          <a-input-number
            id="expectTorrents"
            v-model:value="expectTorrents"
            :min="25"
            :max="200"
            :step="25"
            size="small"
          />
        </div>
        <div>
          <a-tooltip>
            <template #title>
              {{ $t('settings.timeoutTip') }}
            </template>
            {{ `${$t('settings.timeout')}:` }}
          </a-tooltip>
          <a-input-number
            id="timeout"
            v-model:value="timeout"
            :min="5000"
            :max="30000"
            :step="5000"
            size="small"
          />
        </div>
      </a-space>
    </a-collapse-panel>
    <a-collapse-panel v-for="siteKey in showSites" :key="siteKey" :header="sites[siteKey].name">
      <SiteSearchConfig :site="siteKey" />
    </a-collapse-panel>
  </a-collapse>
</template>
