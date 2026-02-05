<script setup lang="ts">
const props = defineProps<{
  workspaceId: string
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const { data: accounts } = await useFetch(`/api/accounts?workspace_id=${props.workspaceId}`)
</script>

<template>
  <div class="space-y-2">
    <UiLabel>Conta / Carteira</UiLabel>
    <select 
      :value="modelValue" 
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <option value="" disabled>Selecione uma conta</option>
      <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
        {{ acc.name }}
      </option>
    </select>
  </div>
</template>
