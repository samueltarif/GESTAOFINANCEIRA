<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'

interface DatasetType {
  label: string
  data: number[]
  borderColor: string
  backgroundColor: string
  tension?: number
  fill?: boolean
  borderDash?: number[]
  borderWidth?: number
  pointRadius?: number
}

interface Props {
  data: {
    labels: string[]
    datasets: DatasetType[]
  }
  title?: string
  subtitle?: string
  showTrend?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showTrend: true
})

const canvasRef = ref<HTMLCanvasElement>()
let chartInstance: any = null
let Chart: any = null

// Calcular linha de tendência usando regressão linear simples
const calculateTrendLine = (data: number[]) => {
  const n = data.length
  if (n === 0) return []
  
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0
  
  for (let i = 0; i < n; i++) {
    const value = data[i] ?? 0
    sumX += i
    sumY += value
    sumXY += i * value
    sumX2 += i * i
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  
  return data.map((_, i) => slope * i + intercept)
}

const chartData = computed(() => {
  if (!props.showTrend || !props.data.datasets || props.data.datasets.length === 0) {
    return props.data
  }
  
  // Adicionar linha de tendência para cada dataset
  const trendDatasets: DatasetType[] = props.data.datasets.map(dataset => {
    const trendData = calculateTrendLine(dataset.data || [])
    return {
      label: `${dataset.label} (Tendência)`,
      data: trendData,
      borderColor: dataset.borderColor,
      backgroundColor: 'transparent',
      borderDash: [5, 5],
      borderWidth: 2,
      pointRadius: 0,
      tension: 0
    }
  })
  
  return {
    labels: props.data.labels,
    datasets: [...props.data.datasets, ...trendDatasets]
  }
})

const initChart = async () => {
  if (!canvasRef.value || !chartData.value.labels.length) return
  
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
    data: chartData.value,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
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
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  })
}

onMounted(() => {
  initChart()
})

watch(() => chartData.value, () => {
  initChart()
}, { deep: true })
</script>

<template>
  <div class="w-full h-full">
    <div v-if="title" class="mb-4">
      <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
      <p v-if="subtitle" class="text-sm text-gray-600">{{ subtitle }}</p>
    </div>
    <div class="flex items-center justify-center">
      <canvas ref="canvasRef"></canvas>
    </div>
  </div>
</template>
