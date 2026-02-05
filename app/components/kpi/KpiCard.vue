<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  icon?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  class?: string
}

const props = defineProps<Props>()

const formatValue = (value: string | number) => {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }
  return value
}

const trendColor = computed(() => {
  switch (props.trend) {
    case 'up': return 'text-green-600'
    case 'down': return 'text-red-600'
    default: return 'text-gray-600'
  }
})
</script>

<template>
  <Card :class="props.class">
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-sm font-medium">{{ title }}</CardTitle>
      <div v-if="icon" class="h-4 w-4 text-muted-foreground">
        <Icon :name="icon" />
      </div>
    </CardHeader>
    <CardContent>
      <div class="text-2xl font-bold">{{ formatValue(value) }}</div>
      <p v-if="trendValue" :class="['text-xs', trendColor]">
        {{ trendValue }}
      </p>
    </CardContent>
  </Card>
</template>