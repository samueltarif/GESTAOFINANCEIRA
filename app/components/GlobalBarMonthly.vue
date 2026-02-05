<script setup lang="ts">
interface Props {
  data: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      backgroundColor: string
    }>
  }
}

const props = defineProps<Props>()
</script>

<template>
  <ChartsBarChart 
    :data="data" 
    title="Evolução Mensal"
  />
</template>
