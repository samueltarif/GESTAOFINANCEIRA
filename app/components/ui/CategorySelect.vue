<script setup lang="ts">
const props = defineProps<{
  workspaceId: string
  modelValue: string
  type: 'revenue' | 'expense'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const { data: categories } = await useFetch(`/api/categories?workspace_id=${props.workspaceId}&type=${props.type}`)

const filteredCategories = computed(() => {
  return categories.value?.filter(c => c.type === props.type) || []
})
</script>

<template>
  <div class="space-y-2">
    <UiLabel>Categoria</UiLabel>
    <select 
      :value="modelValue" 
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <option value="" disabled>Selecione uma categoria</option>
      <option v-for="cat in filteredCategories" :key="cat.id" :value="cat.id">
        {{ cat.name }}
      </option>
    </select>
  </div>
</template>
