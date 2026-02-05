<script setup lang="ts">
const props = defineProps<{
  modelValue: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: number): void
}>()

const formattedValue = computed({
  get: () => {
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(props.modelValue)
  },
  set: (val: string) => {
    const numericValue = Number(val.replace(/\D/g, '')) / 100
    emit('update:modelValue', numericValue)
  }
})
</script>

<template>
  <div class="relative">
    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
    <Input 
      v-model="formattedValue" 
      class="pl-10 text-xl font-bold" 
      placeholder="0,00"
    />
  </div>
</template>
