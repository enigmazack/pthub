<template>
  <a-row type="flex" justify="space-between">
    <a-col>
      <a-space size="middle">
        <div class="header-element">
          <MenuUnfoldOutlined v-if="collapsed" @click="toggleCollapsed"/>
          <MenuFoldOutlined v-else @click="toggleCollapsed"/>
        </div>
        <div class="header-element">PT hub</div>
      </a-space>
    </a-col>
    <a-col :pull= "2" :span="8">
      <a-input
        v-model:value="searchKey"
        placeholder="搜索"
        size="large"
        @pressEnter="toSearch"
      >
      <template #addonAfter>
          <a-select style="width: 80px">
            <a-select-option value=".com">.com</a-select-option>
            <a-select-option value=".jp">.jp</a-select-option>
            <a-select-option value=".cn">.cn</a-select-option>
            <a-select-option value=".org">.org</a-select-option>
          </a-select>
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
import LanguageMenu from './LanguageMenu.vue'
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue'
import { useStore, EActions } from '@/store'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'appHeader',
  components: {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    LanguageMenu
  },
  setup () {
    const store = useStore()
    const router = useRouter()
    const collapsed = computed(() => store.state.uiSettings.siderCollapsed)
    const toggleCollapsed = () => store.dispatch(EActions.toggleSiderCollapsed)

    const searchKey = ref('')
    const toSearch = () => {
      router.push('/search')
    }
    return {
      collapsed,
      toggleCollapsed,
      searchKey,
      toSearch
    }
  }
})
</script>

<style>
span.ant-input-group-wrapper {
  vertical-align: middle
}
div.header-element {
  font-size: 24px;
  color: white
}
</style>
