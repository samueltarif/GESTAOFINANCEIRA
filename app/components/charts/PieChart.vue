<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface Props {
  data: {
    labels: string[]
    datasets: Array<{
      data: number[]
      backgroundColor: string[]
    }>
  }
}

const props = defineProps<Props>()
const canvasRef = ref<HTMLCanvasElement>()
let chartInstance: any = null
let Chart: any = null

const initChart = async () => {
  if (!canvasRef.value || !props.data.labels.length) return
  
  // Lazy load Chart.js apenas quando necessário
  if (!Chart) {
    const chartModule = await import('chart.js')
    Chart = chartModule.Chart
    Chart.register(...chartModule.registerables)
  }
  
  if (chartInstance) {
    chartInstance.destroy()
  }
  
  chartInstance = new Chart(canvasRef.value, {
    type: 'pie',
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: false, // Desabilitar animações para melhor performance
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            usePointStyle: true,
            font: {
              size: 12
            }
          }
        }
      }
    }
  })
}

onMounted(() => {
  initChart()
})

watch(() => props.data, () => {
  initChart()
}, { deep: true })
</script>

<template>
  <div class="w-full h-full flex items-center justify-center">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>