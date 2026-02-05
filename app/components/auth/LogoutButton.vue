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
      // Redirecionar para a página de login
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
  <Button
    variant="outline"
    @click="handleLogout"
    :disabled="loading"
    class="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
  >
    <template v-if="loading">
      <span class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
      Saindo...
    </template>
    <template v-else>
      🚪 Sair
    </template>
  </Button>
</template>