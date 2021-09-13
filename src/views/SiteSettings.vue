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
      <div v-for="config in getSearchConfig(siteKey)" :key="config.siteKey">
        <a-form layout="inline" :model="config">
          <a-form-item label="Config Name">
            <a-input v-model:value="config.name" />
          </a-form-item>
          <a-form-item label="Config Pattern">
            <a-input v-model:value="config.pattern" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary">Submit</a-button>
          </a-form-item>
        </a-form>
      </div>
      <div>
        <a-form layout="inline" :model="newSearchConfigs[siteKey]">
          <a-form-item label="Config Name">
            <a-input v-model:value="newSearchConfigs[siteKey].value.name" />
          </a-form-item>
          <a-form-item label="Config Pattern">
            <a-input />
          </a-form-item>
          <a-form-item>
            <a-button type="primary">Submit</a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-collapse-panel>
  </a-collapse>
</template>

<script lang="ts">
import { defineComponent, ref, inject, watch, Ref } from 'vue'
import { Sites } from '@/sites'
import { useStore } from '@/store'
import _ from 'lodash'
import { EActions } from '@/store/enum'
import { SearchConfig } from '@/store/modules/siteData'

interface NewSearchConfigs {
  [key: string]: Ref<SearchConfig>
}

export default defineComponent({
  name: 'siteSettings',
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

    const newSearchConfigs: NewSearchConfigs = {}
    enabledSites.forEach(siteKey => {
      newSearchConfigs[siteKey] = ref({ siteKey, name: '', pattern: '' })
    })

    return {
      activeKey,
      searchText,
      sites,
      enabledSites,
      concurrencyRequests,
      getSearchConfig,
      newSearchConfigs
    }
  }
})
</script>
