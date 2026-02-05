<script setup lang="ts">
import Label from '@/components/ui/Label.vue'
import Input from '@/components/ui/Input.vue'

defineProps<{
  label: string
  modelValue: string | number
  type?: string
  placeholder?: string
  id: string
  required?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()
</script>

<template>
  <div class="grid w-full items-center gap-1.5">
    <Label :for="id">{{ label }}</Label>
    <Input
      :id="id"
      :type="type"
      :placeholder="placeholder"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :required="required"
    />
  </div>
</template>
