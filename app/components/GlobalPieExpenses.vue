<script setup lang="ts">
defineProps<{
  data: {
    labels: string[]
    datasets: {
      data: number[]
      backgroundColor: string[]
    }[]
  }
}>()
</script>

<template>
  <UiCard class="p-6">
    <h3 class="text-lg font-semibold mb-4">Gastos por Categoria</h3>
    <ChartsPieChart :data="data" />
  </UiCard>
</template>
