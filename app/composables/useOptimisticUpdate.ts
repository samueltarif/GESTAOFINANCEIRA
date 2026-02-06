/**
 * Composable para atualizações otimistas
 * Atualiza a UI imediatamente e sincroniza com o backend depois
 */
export const useOptimisticUpdate = () => {
  const pendingUpdates = ref<Map<string, any>>(new Map())

  const optimisticUpdate = async <T>(
    key: string,
    optimisticData: T,
    apiCall: () => Promise<T>,
    onSuccess?: (data: T) => void,
    onError?: (error: any) => void
  ) => {
    // 1. Atualiza UI imediatamente
    pendingUpdates.value.set(key, optimisticData)

    try {
      // 2. Faz chamada ao backend em background
      const result = await apiCall()
      
      // 3. Atualiza com dados reais
      pendingUpdates.value.delete(key)
      onSuccess?.(result)
      
      return result
    } catch (error) {
      // 4. Reverte em caso de erro
      pendingUpdates.value.delete(key)
      onError?.(error)
      throw error
    }
  }

  return {
    optimisticUpdate,
    pendingUpdates: readonly(pendingUpdates)
  }
}
