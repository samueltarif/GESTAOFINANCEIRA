<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface Props {
  data: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      backgroundColor: string
    }>
  }
  title?: string
}

const props = defineProps<Props>()
const canvasRef = ref<HTMLCanvasElement>()
let chartInstance: any = null

const initChart = async () => {
  if (!canvasRef.value || !props.data.labels.length) return
  
  // Importação dinâmica do Chart.js
  const { Chart, registerables } = await import('chart.js')
  Chart.register(...registerables)
  
  // Destruir gráfico anterior se existir
  if (chartInstance) {
    chartInstance.destroy()
  }
  
  chartInstance = new Chart(canvasRef.value, {
    type: 'bar',
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value: any) {
              return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 0
              }).format(value)
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
  <UiCard>
    <UiCardHeader v-if="title">
      <UiCardTitle>{{ title }}</UiCardTitle>
    </UiCardHeader>
    <UiCardContent>
      <div class="h-[300px] relative">
        <canvas ref="canvasRef"></canvas>
      </div>
    </UiCardContent>
  </UiCard>
</template>