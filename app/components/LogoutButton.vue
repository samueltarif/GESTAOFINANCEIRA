<script setup lang="ts">
const supabase = useSupabaseClient()
const loading = ref(false)

async function handleLogout() {
  loading.value = true
  
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Erro ao fazer logout:', error)
    } else {
      console.log('Logout realizado com sucesso')
      await navigateTo('/login')
    }
  } catch (error) {
    console.error('Erro no logout:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <button
    @click="handleLogout"
    :disabled="loading"
    class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <template v-if="loading">
      <span class="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
      Saindo...
    </template>
    <template v-else>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      Sair
    </template>
  </button>
</template>