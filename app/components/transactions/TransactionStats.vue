<script setup lang="ts">
// Props
interface Props {
  count: number
  totalIncome: number
  totalExpense: number
  balance: number
}

defineProps<Props>()

// Função para formatar moeda
function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <!-- Total de Transações -->
    <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p class="text-sm text-gray-600">Total de Transações</p>
      <p class="text-2xl font-bold text-gray-900">{{ count }}</p>
    </div>

    <!-- Receitas -->
    <div class="rounded-lg border border-green-200 bg-green-50 p-4 shadow-sm">
      <p class="text-sm text-green-700">Receitas</p>
      <p class="text-2xl font-bold text-green-600">{{ formatCurrency(totalIncome) }}</p>
    </div>

    <!-- Despesas -->
    <div class="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
      <p class="text-sm text-red-700">Despesas</p>
      <p class="text-2xl font-bold text-red-600">{{ formatCurrency(totalExpense) }}</p>
    </div>

    <!-- Saldo -->
    <div class="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm">
      <p class="text-sm text-blue-700">Saldo</p>
      <p class="text-2xl font-bold" :class="balance >= 0 ? 'text-blue-600' : 'text-red-600'">
        {{ formatCurrency(balance) }}
      </p>
    </div>
  </div>
</template>
