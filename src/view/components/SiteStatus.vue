<template>
  <div v-if="connecting">
    <LoadingOutlined :style="{color: 'blue'}" />
    {{ $t('siteStatus.connecting') }}
  </div>
  <div v-else-if="login">
    <CheckCircleOutlined :style="{color: 'green'}" />
    {{ $t('siteStatus.login') }}
  </div>
  <div v-else-if="unknow">
    <QuestionCircleOutlined :style="{color: 'gray'}" />
    {{ $t('siteStatus.unknow') }}
  </div>
  <div v-else-if="logout">
    <MinusCircleOutlined :style="{color: 'orange'}" />
    {{ $t('siteStatus.logout') }}
  </div>
  <div v-else-if="timeout">
    <CloseCircleOutlined :style="{color: 'red'}" />
    {{ $t('siteStatus.timeout') }}
  </div>
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
    status: { type: String, required: true }
  },
  setup (props) {
    const connecting = computed(() => props.status === ESiteStatus.connecting)
    const login = computed(() => props.status === ESiteStatus.login)
    const unknow = computed(() => props.status === ESiteStatus.unknow)
    const logout = computed(() => props.status === ESiteStatus.logout)
    const timeout = computed(() => props.status === ESiteStatus.timeout)
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
