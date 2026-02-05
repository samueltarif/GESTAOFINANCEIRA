<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const isLoggingOut = ref(false)

async function handleLogout() {
  isLoggingOut.value = true
  
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Erro ao fazer logout:', error)
    } else {
      console.log('Logout realizado com sucesso')
      await router.push('/login')
    }
  } catch (error) {
    console.error('Erro durante logout:', error)
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<template>
  <header class="bg-white border-b border-border shadow-sm">
    <div class="max-w-7xl mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo/Título -->
        <div class="flex items-center gap-4">
          <NuxtLink to="/dashboard" class="text-2xl font-bold text-primary">
            💰 Controle Financeiro
          </NuxtLink>
        </div>

        <!-- Navegação -->
        <nav class="hidden md:flex items-center gap-6">
          <NuxtLink 
            to="/dashboard" 
            class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink 
            to="/workspaces" 
            class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Workspaces
          </NuxtLink>
        </nav>

        <!-- User Menu -->
        <div class="flex items-center gap-4">
          <!-- User Info -->
          <div class="hidden sm:flex items-center gap-2 text-sm">
            <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span class="text-primary font-medium">
                {{ user?.email?.charAt(0).toUpperCase() }}
              </span>
            </div>
            <span class="text-muted-foreground">{{ user?.email }}</span>
          </div>

          <!-- Logout Button -->
          <Button
            variant="outline"
            size="sm"
            @click="handleLogout"
            :disabled="isLoggingOut"
            class="flex items-center gap-2"
          >
            <template v-if="isLoggingOut">
              <span class="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
              Saindo...
            </template>
            <template v-else>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </template>
          </Button>
        </div>
      </div>
    </div>
  </header>
</template>