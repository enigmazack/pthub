<template>
  <LoadingOutlined v-if="connecting" :style="{color: 'blue'}" />
  <CheckCircleOutlined v-else-if="login" :style="{color: 'green'}" />
  <QuestionCircleOutlined v-else-if="unknow" :style="{color: 'gray'}" />
  <MinusCircleOutlined v-else-if="logout" :style="{color: 'orange'}" />
  <CloseCircleOutlined v-else-if="timeout" :style="{color: 'red'}" />
</template>

<script lang = "ts">
import { computed, defineComponent } from 'vue'
import {
  LoadingOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
  MinusCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons-vue'
import { ESiteStatus } from '@/sites'
import { useStore } from '../store'

export default defineComponent({
  name: 'siteStatus',
  components: {
    LoadingOutlined,
    CheckCircleOutlined,
    QuestionCircleOutlined,
    MinusCircleOutlined,
    CloseCircleOutlined
  },
  props: {
    site: { type: String, required: true }
  },
  setup (props) {
    const store = useStore()
    const connecting = computed(() => store.state.siteStatus[props.site] === ESiteStatus.connecting)
    const login = computed(() => store.state.siteStatus[props.site] === ESiteStatus.login)
    const unknow = computed(() => store.state.siteStatus[props.site] === ESiteStatus.unknow)
    const logout = computed(() => store.state.siteStatus[props.site] === ESiteStatus.logout)
    const timeout = computed(() => store.state.siteStatus[props.site] === ESiteStatus.timeout)
    return {
      connecting,
      login,
      unknow,
      logout,
      timeout
    }
  }
})
</script>
