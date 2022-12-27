<script lang = "ts" setup>
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  MinusCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons-vue'
import { ESiteStatus } from '~/sites'

const props = defineProps({
  status: { type: String, required: true },
})

const connecting = computed(() => props.status === ESiteStatus.connecting)
const login = computed(() => props.status === ESiteStatus.login)
const unknow = computed(() => props.status === ESiteStatus.unknow)
const logout = computed(() => props.status === ESiteStatus.logout)
const timeout = computed(() => props.status === ESiteStatus.timeout)
const getUserDataFailed = computed(() => props.status === ESiteStatus.getUserDataFailed)
</script>

<template>
  <div v-if="connecting" class="site-status">
    <LoadingOutlined v-if="connecting" :style="{ color: 'blue' }" />
    {{ $t('siteStatus.connecting') }}
  </div>
  <div v-else-if="login" class="site-status">
    <CheckCircleOutlined :style="{ color: 'green' }" />
    {{ $t('siteStatus.login') }}
  </div>
  <div v-else-if="unknow" class="site-status">
    <QuestionCircleOutlined :style="{ color: 'gray' }" />
    {{ $t('siteStatus.unknow') }}
  </div>
  <div v-else-if="logout" class="site-status">
    <MinusCircleOutlined :style="{ color: 'orange' }" />
    {{ $t('siteStatus.logout') }}
  </div>
  <div v-else-if="timeout" class="site-status">
    <CloseCircleOutlined :style="{ color: 'red' }" />
    {{ $t('siteStatus.timeout') }}
  </div>
  <div v-else-if="getUserDataFailed" class="site-status">
    <CloseCircleOutlined :style="{ color: 'red' }" />
    {{ $t('siteStatus.getUserDataFailed') }}
  </div>
</template>

<style>
.site-status {
  float: left;
  margin-right: 8px;
}
</style>
