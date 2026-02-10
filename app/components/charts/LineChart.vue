<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface Props {
  data: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      borderColor: string
      backgroundColor: string
      tension?: number
      fill?: boolean
    }>
  }
  title?: string
  showLegend?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLegend: true
})

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
    type: 'line',
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: props.showLegend,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              let label = context.dataset.label || ''
              if (label) {
                label += ': '
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(context.parsed.y)
              }
              return label
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
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
  <div class="w-full h-full flex items-center justify-center">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>
