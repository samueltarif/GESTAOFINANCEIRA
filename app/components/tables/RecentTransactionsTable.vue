<script setup lang="ts">
interface Transaction {
  id: string
  date: string
  description: string
  category: string
  type: 'revenue' | 'expense'
  amount: number
}

interface Props {
  transactions: Transaction[]
}

const props = defineProps<Props>()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

const getTypeColor = (type: string) => {
  return type === 'revenue' ? 'text-green-600' : 'text-red-600'
}

const getTypeLabel = (type: string) => {
  return type === 'revenue' ? 'Receita' : 'Despesa'
}
</script>

<template>
  <UiCard>
    <UiCardHeader>
      <UiCardTitle>Transações Recentes</UiCardTitle>
    </UiCardHeader>
    <UiCardContent>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2 px-4 font-medium text-muted-foreground">Data</th>
              <th class="text-left py-2 px-4 font-medium text-muted-foreground">Descrição</th>
              <th class="text-left py-2 px-4 font-medium text-muted-foreground">Categoria</th>
              <th class="text-left py-2 px-4 font-medium text-muted-foreground">Tipo</th>
              <th class="text-right py-2 px-4 font-medium text-muted-foreground">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!transactions.length">
              <td colspan="5" class="text-center py-8 text-muted-foreground">
                Nenhuma transação encontrada
              </td>
            </tr>
            <tr 
              v-for="transaction in transactions" 
              :key="transaction.id"
              class="border-b hover:bg-muted/50"
            >
              <td class="py-3 px-4">{{ formatDate(transaction.date) }}</td>
              <td class="py-3 px-4">{{ transaction.description || '-' }}</td>
              <td class="py-3 px-4">{{ transaction.category }}</td>
              <td class="py-3 px-4">
                <span :class="getTypeColor(transaction.type)">
                  {{ getTypeLabel(transaction.type) }}
                </span>
              </td>
              <td class="py-3 px-4 text-right font-medium" :class="getTypeColor(transaction.type)">
                {{ formatCurrency(transaction.amount) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiCardContent>
  </UiCard>
</template>