<template>
  <a-table :data-source="dataSource" :columns="columns" :pagination="false">
    <template #nameTitle>{{ $t('tableHead.name') }}</template>
    <template #patternTitle>{{ $t('tableHead.searchPattern') }}</template>
    <template #operationTitle>{{ $t('tableHead.operation') }}</template>
    <template #name="{ text, record }">
      <div>
        <a-input
          v-if="editableData[record.key]"
          v-model:value="editableData[record.key].name"
          style="margin: -5px 0"
          @pressEnter="save(record.key)"
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
          @pressEnter="save(record.key)"
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
  <a-button class="editable-add-btn" @click="handleAdd" style="margin-top: 8px">Add</a-button>
</template>

<script lang="ts">
import { defineComponent, UnwrapRef, reactive, computed } from 'vue'
import { SearchConfig } from '@/store/modules/siteData'
import { useStore } from '@/store'
import _ from 'lodash'
import { EActions, EMutations } from '@/store/enum'

interface SearchConfigWithKey extends SearchConfig {
  key: string
}

export default defineComponent({
  name: 'siteSearchConfig',
  props: {
    site: { type: String, required: true }
  },
  setup (props) {
    const store = useStore()
    const columns = [
      {
        dataIndex: 'name',
        width: '12%',
        slots: { title: 'nameTitle', customRender: 'name' }
      },
      {
        dataIndex: 'pattern',
        slots: { title: 'patternTitle', customRender: 'pattern' }
      },
      {
        dataIndex: 'operation',
        width: '12%',
        slots: { title: 'operationTitle', customRender: 'operation' }
      }
    ]

    const dataSource = computed(() => {
      const sConfigs = store.state.siteData.searchConfigs.filter(config =>
        config.siteKey === props.site)
      const searchConfig: SearchConfigWithKey[] = []
      let key = 1
      sConfigs.forEach(config => {
        searchConfig.push({
          key: key.toString(),
          ...config
        })
        key += 1
      })
      return searchConfig
    })

    const editableData: UnwrapRef<Record<string, SearchConfig>> = reactive({})

    const removeKey = (dataWithKey: SearchConfigWithKey): SearchConfig => {
      const { siteKey, name, pattern } = dataWithKey
      return { siteKey, name, pattern }
    }

    const edit = (key: string) => {
      editableData[key] = _.cloneDeep(dataSource.value.filter(config => key === config.key)[0])
    }
    const save = (key: string) => {
      const dataOfKey = dataSource.value.filter(config => key === config.key)[0]
      const searchConfig = removeKey(dataOfKey)
      // if name changed, remove the old config first
      if (editableData[key].name !== searchConfig.name) {
        store.commit(EMutations.deleteSearchConfigs, searchConfig)
      }
      // if name conflict with others, add _ after the name
      // store dispatch EActions.updateSearchConfigs will cover config with the same name
      const dateOfOthers = dataSource.value.filter(config => key !== config.key)
      while (true) {
        if (dateOfOthers.every(config => config.name !== editableData[key].name)) {
          break
        } else {
          editableData[key].name += '_'
        }
      }
      store.dispatch(EActions.updateSearchConfigs, { searchConfig: editableData[key] })
      delete editableData[key]
    }
    const cancel = (key: string) => {
      delete editableData[key]
      // when cancel a new added config, delete it in the data source
      const index = dataSource.value.findIndex(config => key === config.key)
      if (index !== -1) {
        const searchConfig = dataSource.value[index]
        if (searchConfig.name === '' && searchConfig.pattern === '') {
          store.commit(EMutations.deleteSearchConfigs, searchConfig)
        }
      }
    }
    const handleDelete = (key: string) => {
      const dataOfKey = dataSource.value.filter(config => key === config.key)[0]
      const searchConfig = removeKey(dataOfKey)
      store.dispatch(EActions.deleteSearchConfigs, { searchConfig })
    }
    const handleAdd = () => {
      const currentKeys = dataSource.value.map(config => parseInt(config.key))
      const maxKey = _.max(currentKeys)
      const key = maxKey ? maxKey + 1 : 0
      const emptyConfig = { key: key.toString(), siteKey: props.site, name: '', pattern: '' }
      store.commit(EMutations.updateSearchConfigs, emptyConfig)
      editableData[emptyConfig.key] = _.cloneDeep(emptyConfig)
    }

    const displaySearchPattern = (text: string) => {
      return text.replace('{}', '<span class="highlights-text">{}</span>')
    }

    return {
      columns,
      dataSource,
      editableData,
      edit,
      save,
      cancel,
      handleAdd,
      handleDelete,
      displaySearchPattern
    }
  }
})
</script>

<style>
.editable-row-operations a {
  margin-right: 8px;
}
.highlights-text {
  color: #ff5134;
}
</style>
