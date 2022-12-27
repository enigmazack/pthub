<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import _ from 'lodash'
import bus from '../bus'
import LanguageMenu from './LanguageMenu.vue'
import { EActions, EMutations, useStore } from '~/store'

const store = useStore()
const { t } = useI18n()
const router = useRouter()
const collapsed = computed(() => store.state.uiSettings.siderCollapsed)
const toggleCollapsed = () => store.dispatch(EActions.toggleSiderCollapsed)

const search = ref('')
const toSearch = () => {
  store.commit(EMutations.setSearchText, search.value)
  bus.emit('search')
  router.push({ path: '/torrents' })
}

const selectedConfig = computed(() => store.state.siteSettings.selectedConfig)
const configOptions = computed(() => {
  const options = [{ value: 'default', label: t('default') }]
  const configNames = store.state.siteSettings.searchConfigs.map(sConfig => sConfig.name)
  _.uniq(configNames).forEach((name) => {
    options.push({
      value: name,
      label: name,
    })
  })
  return options
})

const handleChange = (value: string) => {
  store.dispatch(EActions.setSelectedConfig, { configName: value })
}
</script>

<template>
  <a-row type="flex" justify="space-between">
    <a-col>
      <a-space size="middle">
        <div class="header-element">
          <MenuUnfoldOutlined v-if="collapsed" @click="toggleCollapsed" />
          <MenuFoldOutlined v-else @click="toggleCollapsed" />
        </div>
        <div class="header-element">
          PT hub
        </div>
      </a-space>
    </a-col>
    <a-col :pull="2" :span="8">
      <a-input
        v-model:value="search"
        :placeholder="$t('placeholder.search')"
        size="large"
        @press-enter="toSearch"
      >
        <template #addonAfter>
          <a-select
            style="width: 100px"
            :value="selectedConfig"
            :options="configOptions"
            @change="handleChange"
          />
        </template>
      </a-input>
    </a-col>
    <a-col>
      <a-space size="middle">
        <div class="header-element">
          <LanguageMenu />
        </div>
      </a-space>
    </a-col>
  </a-row>
</template>

<style>
span.ant-input-group-wrapper {
  vertical-align: middle;
}
div.header-element {
  font-size: 24px;
  color: white;
}
</style>
