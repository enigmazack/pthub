<script lang="ts" setup>
import type { UnwrapRef } from 'vue'
import type { SearchConfig } from '~/store/modules/siteSettings/state'
import { EActions, EMutations, useStore } from '~/store'

const props = defineProps({
  site: { type: String, required: true },
})

const store = useStore()
const columns = [
  {
    key: 'name',
    dataIndex: 'name',
    width: '12%',
    slots: { title: 'nameTitle', customRender: 'name' },
  },
  {
    key: 'pattern',
    dataIndex: 'pattern',
    slots: { title: 'patternTitle', customRender: 'pattern' },
  },
  {
    key: 'operation',
    dataIndex: 'operation',
    width: '12%',
    slots: { title: 'operationTitle', customRender: 'operation' },
  },
]

const dataSource = computed(() => store.state.siteSettings.searchConfigs.filter(config =>
  config.siteKey === props.site),
)

const editableData: UnwrapRef<Record<string, SearchConfig>> = reactive({})

const edit = (key: string) => {
  const dataOfKey = dataSource.value.filter(config => key === config.key)[0]
  editableData[key] = {
    siteKey: dataOfKey.siteKey,
    name: dataOfKey.name,
    pattern: dataOfKey.pattern,
  }
}
const save = (key: string) => {
  // if name conflict with others, add _ after the name
  /* const dateOfOthers = dataSource.value.filter(config => config.key !== key)
      while (true) {
        if (dateOfOthers.every(config => config.name !== editableData[key].name)) {
          break
        } else {
          editableData[key].name += '_'
        }
      } */
  store.dispatch(EActions.updateSearchConfigs, {
    searchConfigWithKey: {
      key, ...editableData[key],
    },
  })
  delete editableData[key]
}
const cancel = (key: string) => {
  delete editableData[key]
  // when cancel a new added config, delete it in the data source
  const searchConfig = dataSource.value.filter(config => config.key === key)[0]
  if (searchConfig.name === '' && searchConfig.pattern === '')
    store.commit(EMutations.deleteSearchConfigs, key)
}
const handleDelete = (key: string) => {
  store.dispatch(EActions.deleteSearchConfigs, { key })
}
const handleAdd = () => {
  const emptyConfig = { key: '', siteKey: props.site, name: '', pattern: '' }
  // commit will assign a uuid to the emptyConfig.key
  store.commit(EMutations.addSearchConfigs, emptyConfig)
  editableData[emptyConfig.key] = { siteKey: props.site, name: '', pattern: '' }
}

const displaySearchPattern = (text: string) => {
  return text.replace('{}', '<span class="highlights-text">{}</span>')
}
</script>

<template>
  <a-table :data-source="dataSource" :columns="columns" :pagination="false">
    <template #title>
      {{ $t('settings.searchConfig') }}
    </template>
    <template #nameTitle>
      {{ $t('tableTitle.name') }}
    </template>
    <template #patternTitle>
      {{ $t('tableTitle.searchPattern') }}
    </template>
    <template #operationTitle>
      {{ $t('tableTitle.operation') }}
    </template>
    <template #name="{ text, record }">
      <div>
        <a-input
          v-if="editableData[record.key]"
          v-model:value="editableData[record.key].name"
          style="margin: -5px 0"
          @press-enter="save(record.key)"
        />
        <template v-else>
          {{ text }}
        </template>
      </div>
    </template>
    <template #pattern="{ text, record }">
      <div>
        <a-input
          v-if="editableData[record.key]"
          v-model:value="editableData[record.key].pattern"
          style="margin: -5px 0"
          @press-enter="save(record.key)"
        />
        <template v-else>
          <span v-html="displaySearchPattern(text)" />
        </template>
      </div>
    </template>
    <template #operation="{ record }">
      <div class="editable-row-operations">
        <span v-if="editableData[record.key]">
          <a @click="save(record.key)">{{ $t('button.save') }}</a>
          <a @click="cancel(record.key)">{{ $t('button.cancel') }}</a>
        </span>
        <span v-else>
          <a @click="edit(record.key)">{{ $t('button.edit') }}</a>
          <a-popconfirm :title="$t('button.sureToDelete')" @confirm="handleDelete(record.key)">
            <a>{{ $t('button.delete') }}</a>
          </a-popconfirm>
        </span>
      </div>
    </template>
  </a-table>
  <a-button
    class="editable-add-btn"
    style="margin-top: 8px"
    @click="handleAdd"
  >
    {{ $t('button.add') }}
  </a-button>
</template>

<style>
.editable-row-operations a {
  margin-right: 8px;
}
.highlights-text {
  color: #ff5134;
}
</style>
