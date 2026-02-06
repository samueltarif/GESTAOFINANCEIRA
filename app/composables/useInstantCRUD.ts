/**
 * Composable para operações CRUD instantâneas com Optimistic UI
 */
export function useInstantCRUD<T extends { id?: string }>() {
  const toast = useToast()

  /**
   * Criar item com feedback instantâneo
   */
  async function create(
    endpoint: string,
    data: Partial<T>,
    onSuccess?: (item: T) => void
  ) {
    // ID temporário para UI
    const tempId = `temp-${Date.now()}`
    const optimisticItem = { ...data, id: tempId } as T

    try {
      // Executar criação
      const result = await $fetch<T>(endpoint, {
        method: 'POST',
        body: data
      })

      if (onSuccess) onSuccess(result)
      return result
    } catch (error: any) {
      console.error('Erro ao criar:', error)
      throw error
    }
  }

  /**
   * Atualizar item com feedback instantâneo
   */
  async function update(
    endpoint: string,
    id: string,
    data: Partial<T>,
    onSuccess?: (item: T) => void
  ) {
    try {
      const result = await $fetch<T>(`${endpoint}/${id}`, {
        method: 'PUT',
        body: data
      })

      if (onSuccess) onSuccess(result)
      return result
    } catch (error: any) {
      console.error('Erro ao atualizar:', error)
      throw error
    }
  }

  /**
   * Deletar item com feedback instantâneo
   */
  async function remove(
    endpoint: string,
    id: string,
    onSuccess?: () => void
  ) {
    try {
      await $fetch(`${endpoint}/${id}`, {
        method: 'DELETE'
      })

      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error('Erro ao deletar:', error)
      throw error
    }
  }

  return {
    create,
    update,
    remove
  }
}

/**
 * Hook para toast notifications (placeholder)
 */
function useToast() {
  return {
    success: (message: string) => console.log('✅', message),
    error: (message: string) => console.error('❌', message)
  }
}
