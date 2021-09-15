<template>
  <a-table :data-source="dataSource" :columns="columns" :pagination="false">
    <template #title>
      {{ $t('settings.searchConfig') }}
    </template>
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
        <template v-else>{{ text }}</template>
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
  <a-button
    class="editable-add-btn"
    @click="handleAdd"
    style="margin-top: 8px"
  >{{ $t('button.add') }}</a-button>
</template>

<script lang="ts">
import { defineComponent, UnwrapRef, reactive, computed } from 'vue'
import { SearchConfig } from '@/store/modules/siteSettings'
import { useStore, EActions, EMutations } from '@/store'
import _ from 'lodash'

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

    const dataSource = computed(() => store.state.siteSettings.searchConfigs.filter(config =>
      config.siteKey === props.site)
    )

    const editableData: UnwrapRef<Record<string, SearchConfig>> = reactive({})

    const edit = (key: string) => {
      editableData[key] = _.cloneDeep(dataSource.value.filter(config => key === config.key)[0])
    }
    const save = (key: string) => {
      // if name conflict with others, add _ after the name
      const dateOfOthers = dataSource.value.filter(config => config.key !== key)
      while (true) {
        if (dateOfOthers.every(config => config.name !== editableData[key].name)) {
          break
        } else {
          editableData[key].name += '_'
        }
      }
      store.dispatch(EActions.updateSearchConfigs, {
        searchConfigWithKey: {
          key, ...editableData[key]
        }
      })
      delete editableData[key]
    }
    const cancel = (key: string) => {
      delete editableData[key]
      // when cancel a new added config, delete it in the data source
      const searchConfig = dataSource.value.filter(config => config.key === key)[0]
      if (searchConfig.name === '' && searchConfig.pattern === '') {
        store.commit(EMutations.deleteSearchConfigs, key)
      }
    }
    const handleDelete = (key: string) => {
      store.dispatch(EActions.deleteSearchConfigs, { key })
    }
    const handleAdd = () => {
      const emptyConfig = { key: '', siteKey: props.site, name: '', pattern: '' }
      store.commit(EMutations.addSearchConfigs, emptyConfig)
      editableData[emptyConfig.key] = _.cloneDeep(emptyConfig)
      console.log(emptyConfig.key)
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
