<template>
  <div :style="{
    padding: '15px 0px',
    background: 'white'
  }">
    <a-input-search
      v-model:value="searchText"
      :placeholder="$t('tableHead.searchSites')"
      :style="{
        width: '200px',
        border: 'none',
        borderBottom: '1px solid #e9e3e3',
        margin: '0px 0px'
      }"
    />
  </div>
  <a-collapse
    v-model:activeKey="activeKey"
    :style="{
      borderLeftWidth: '0px',
      borderRightWidth: '0px'
    }"
  >
    <a-collapse-panel key="global" :header="$t('settings.globalSettings')">
      <div>
        <a-tooltip>
          <template #title>{{ $t('settings.concurrencyRequestsTip') }}</template>
          {{ $t('settings.concurrencyRequests') + ':' }}
        </a-tooltip>
        <a-input-number
          id="concurrencyRequests"
          v-model:value="concurrencyRequests"
          :min="1"
          :max="10"
          size="small"
        />
      </div>
    </a-collapse-panel>
    <a-collapse-panel
      v-for="siteKey in enabledSites"
      :key="siteKey"
      :header="sites[siteKey].name"
    >
      <SiteSearchConfig :site="siteKey" />
    </a-collapse-panel>
  </a-collapse>
</template>

<script lang="ts">
import { defineComponent, ref, inject, watch, reactive, toRaw } from 'vue'
import SiteSearchConfig from '@/components/SiteSearchConfig.vue'
import { Sites } from '@/sites'
import { useStore } from '@/store'
import _ from 'lodash'
import { EActions } from '@/store/enum'
import { SearchConfig } from '@/store/modules/siteData'

interface NewSearchConfigs {
  [key: string]: SearchConfig
}

export default defineComponent({
  name: 'siteSettings',
  components: {
    SiteSearchConfig
  },
  setup () {
    const store = useStore()
    const sites = inject('sites') as Sites
    const enabledSites = _.sortBy(store.state.siteData.enabledSites)

    const searchText = ref('')
    const activeKey = ref(['global'])
    watch(
      () => searchText.value,
      (newText) => {
        if (newText !== '') {
          const activeList = _.filter(enabledSites, siteKey =>
            siteKey.toLowerCase().indexOf(searchText.value.toLowerCase()) !== -1 ||
            sites[siteKey].name.toLowerCase().indexOf(searchText.value.toLowerCase()) !== -1)
          activeKey.value = ['global'].concat(activeList)
        } else {
          activeKey.value = ['global']
        }
      }
    )

    const concurrencyRequests = ref(store.state.uiSettings.concurrencyRequests)
    watch(
      () => concurrencyRequests.value,
      (newNumber) => {
        store.dispatch(EActions.setConcurrencyRequests, { number: newNumber })
      }
    )

    const getSearchConfig = (siteKey: string) => {
      const searchConfigs = ref(store.state.siteData.searchConfigs)
      return _.filter(searchConfigs.value, config => config.siteKey === siteKey)
    }

    const nSearchConfigs: NewSearchConfigs = {}
    enabledSites.forEach(siteKey => {
      nSearchConfigs[siteKey] = { siteKey, name: '', pattern: '' }
    })
    const newSearchConfigs = reactive(nSearchConfigs)

    const addSearchConfig = (siteKey: string) => {
      const searchConfig: SearchConfig = toRaw(newSearchConfigs[siteKey])
      newSearchConfigs[siteKey] = { siteKey, name: '', pattern: '' }
      store.dispatch(EActions.updateSearchConfigs, { searchConfig })
    }

    return {
      activeKey,
      searchText,
      sites,
      enabledSites,
      concurrencyRequests,
      getSearchConfig,
      newSearchConfigs,
      addSearchConfig
    }
  }
})
</script>
