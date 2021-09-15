<template>
  <a-row type="flex" justify="space-between">
    <a-col>
      <a-space size="middle">
        <div class="header-element">
          <MenuUnfoldOutlined v-if="collapsed" @click="toggleCollapsed" />
          <MenuFoldOutlined v-else @click="toggleCollapsed" />
        </div>
        <div class="header-element">PT hub</div>
      </a-space>
    </a-col>
    <a-col :pull="2" :span="8">
      <a-input v-model:value="searchKey" placeholder="搜索" size="large" @pressEnter="toSearch">
        <template #addonAfter>
          <a-select
            style="width: 100px"
            :value="value"
            :options="options"
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

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LanguageMenu from './LanguageMenu.vue'
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue'
import { useStore, EActions } from '@/store'
import { useRouter } from 'vue-router'
import _ from 'lodash'

export default defineComponent({
  name: 'appHeader',
  components: {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    LanguageMenu
  },
  setup () {
    const store = useStore()
    const { t } = useI18n()
    const router = useRouter()
    const collapsed = computed(() => store.state.uiSettings.siderCollapsed)
    const toggleCollapsed = () => store.dispatch(EActions.toggleSiderCollapsed)

    const searchKey = ref('')
    const toSearch = () => {
      router.push('/search')
    }

    const defaultString = t('default')
    const value = computed(() => store.state.siteSettings.selectedConfig)
    const options = computed(() => {
      const op = [{ value: 'default', label: defaultString }]
      const configNames = store.state.siteSettings.searchConfigs.map(sConfig => sConfig.name)
      _.uniq(configNames).forEach(name => {
        op.push({
          value: name,
          label: name
        })
      })
      return op
    })

    const handleChange = (value: string) => {
      store.dispatch(EActions.setSelectedConfig, { configName: value })
    }

    return {
      collapsed,
      toggleCollapsed,
      searchKey,
      toSearch,
      value,
      options,
      handleChange
    }
  }
})
</script>

<style>
span.ant-input-group-wrapper {
  vertical-align: middle;
}
div.header-element {
  font-size: 24px;
  color: white;
}
</style>
