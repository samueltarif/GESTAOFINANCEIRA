/**
 * Composable para modais instantâneos
 * Abre o modal imediatamente, carrega dados depois
 */
export const useInstantModal = () => {
  const isOpen = ref(false)
  const isLoading = ref(false)
  const data = ref<any>(null)

  const open = async (loadDataFn?: () => Promise<any>) => {
    // 1. Abre modal IMEDIATAMENTE
    isOpen.value = true
    
    // 2. Carrega dados em background se necessário
    if (loadDataFn) {
      isLoading.value = true
      try {
        data.value = await loadDataFn()
      } catch (error) {
        console.error('Erro ao carregar dados do modal:', error)
      } finally {
        isLoading.value = false
      }
    }
  }

  const close = () => {
    isOpen.value = false
    data.value = null
  }

  return {
    isOpen: readonly(isOpen),
    isLoading: readonly(isLoading),
    data: readonly(data),
    open,
    close
  }
}
