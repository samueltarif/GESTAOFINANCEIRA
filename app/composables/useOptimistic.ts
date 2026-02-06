/**
 * Composable para Optimistic UI
 * Atualiza a interface imediatamente e reverte em caso de erro
 */
export function useOptimistic<T>() {
  const optimisticData = ref<T | null>(null)
  const isOptimistic = ref(false)

  async function execute(
    optimisticValue: T,
    asyncFn: () => Promise<T>,
    onSuccess?: (data: T) => void,
    onError?: (error: any) => void
  ) {
    // Atualizar UI imediatamente
    optimisticData.value = optimisticValue
    isOptimistic.value = true

    try {
      // Executar operação real
      const result = await asyncFn()
      
      // Atualizar com dados reais
      optimisticData.value = result
      isOptimistic.value = false
      
      if (onSuccess) onSuccess(result)
      
      return result
    } catch (error) {
      // Reverter em caso de erro
      optimisticData.value = null
      isOptimistic.value = false
      
      if (onError) onError(error)
      
      throw error
    }
  }

  return {
    optimisticData,
    isOptimistic,
    execute
  }
}
