<script setup lang="ts">
// Props
interface Props {
  currentPage: number
  totalPages: number
  totalItems: number
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

// Funções
const goToPrevious = () => {
  emit('update:currentPage', props.currentPage - 1)
}

const goToNext = () => {
  emit('update:currentPage', props.currentPage + 1)
}
</script>

<template>
  <div v-if="totalPages > 1" class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
    <p class="text-sm text-gray-600">
      Página {{ currentPage }} de {{ totalPages }} ({{ totalItems }} transações)
    </p>
    <div class="flex gap-2">
      <button
        @click="goToPrevious"
        :disabled="currentPage === 1"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Anterior
      </button>
      <button
        @click="goToNext"
        :disabled="currentPage === totalPages"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Próxima
      </button>
    </div>
  </div>
</template>
