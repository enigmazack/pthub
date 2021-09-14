<template>
  <a-button class="editable-add-btn" @click="handleAdd" style="margin-bottom: 8px">Add</a-button>
  <a-table :data-source="dataSource" :columns="columns">
    <template #name="{ text, record }">
      <div class="editable-cell">
        <div v-if="editableData[record.name]" class="editable-cell-input-wrapper">
          <a-input v-model:value="editableData[record.name].name" @pressEnter="save(record.name)" />
          <check-outlined class="editable-cell-icon-check" @click="save(record.name)" />
        </div>
        <div v-else class="editable-cell-text-wrapper">
          {{ text || ' ' }}
          <edit-outlined class="editable-cell-icon" @click="edit(record.key)" />
        </div>
      </div>
    </template>
  </a-table>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, UnwrapRef, reactive } from 'vue'
import { SearchConfig } from '@/store/modules/siteData'
import { useStore } from '@/store'
import _ from 'lodash'
import { EActions } from '@/store/enum'

export default defineComponent({
  name: 'siteSearchConfig',
  props: {
    site: { type: String, required: true }
  },
  setup (props) {
    const store = useStore()
    const columns = [
      {
        title: 'name',
        dataIndex: 'name',
        width: '30%',
        slots: { customRender: 'name' }
      },
      {
        title: 'pattern',
        dataIndex: 'pattern',
        slots: { customRender: 'name' }
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        slots: { customRender: 'operation' }
      }
    ]

    const siteSearchConfigs = store.state.siteData.searchConfigs.filter(config =>
      config.siteKey === props.site)
    const dataSource: Ref<SearchConfig[]> = ref(siteSearchConfigs)

    const editableData: UnwrapRef<Record<string, SearchConfig>> = reactive({})

    const edit = (name: string) => {
      editableData[name] = _.cloneDeep(dataSource.value.filter(config => name === config.name)[0])
    }
    const save = async (name: string) => {
      const searchConfig = dataSource.value.filter(config => name === config.name)[0]
      await store.dispatch(EActions.deleteSearchConfigs, { searchConfig })
      Object.assign(searchConfig, editableData[name])
      delete editableData[name]
      await store.dispatch(EActions.updateSearchConfigs, { searchConfig })
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const handleAdd = () => {}

    return {
      columns,
      dataSource,
      editableData,
      edit,
      save,
      handleAdd
    }
  }
})
</script>
