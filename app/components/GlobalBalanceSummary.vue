<script setup lang="ts">
defineProps<{
  totalBalance: number
  totalRevenue: number
  totalExpenses: number
  profit: number
}>()

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <KpiCard
      title="Saldo Total"
      :value="formatCurrency(totalBalance)"
      icon="lucide:wallet"
      trend="neutral"
    />
    <KpiCard
      title="Total de Receitas"
      :value="formatCurrency(totalRevenue)"
      icon="lucide:trending-up"
      trend="up"
    />
    <KpiCard
      title="Total de Despesas"
      :value="formatCurrency(totalExpenses)"
      icon="lucide:trending-down"
      trend="down"
    />
    <KpiCard
      title="Lucro / Sobra"
      :value="formatCurrency(profit)"
      icon="lucide:piggy-bank"
      :trend="profit >= 0 ? 'up' : 'down'"
    />
  </div>
</template>
