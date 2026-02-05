<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import Dialog from '@/components/ui/Dialog.vue'
import DialogContent from '@/components/ui/DialogContent.vue'
import DialogHeader from '@/components/ui/DialogHeader.vue'
import DialogTitle from '@/components/ui/DialogTitle.vue'
import DialogDescription from '@/components/ui/DialogDescription.vue'
import DialogFooter from '@/components/ui/DialogFooter.vue'

definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()

// Função de logout
async function handleLogout() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Erro no logout:', error)
    } else {
      console.log('Logout realizado com sucesso')
      await navigateTo('/login')
    }
  } catch (error) {
    console.error('Erro durante logout:', error)
  }
}

const { data: workspaces, pending, refresh } = await useFetch('/api/workspaces')

const isModalOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-muted/30 p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header da página -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Meus Workspaces</h1>
          <p class="text-muted-foreground">Gerencie seus espaços financeiros isolados.</p>
        </div>
        <div class="flex gap-2">
          <!-- Botão de Logout -->
          <Button 
            variant="outline" 
            @click="handleLogout"
            class="text-red-600 border-red-200 hover:bg-red-50"
          >
            🚪 Sair
          </Button>
          <NuxtLink to="/dashboard">
            <Button variant="outline">Voltar ao Dashboard</Button>
          </NuxtLink>
          <Button @click="isModalOpen = true">+ Novo Workspace</Button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 3" :key="i" class="h-48 rounded-xl border bg-card animate-pulse"></div>
      </div>

      <!-- Content -->
      <div v-else-if="workspaces && workspaces.length > 0" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <WorkspacesWorkspaceCard 
          v-for="workspace in workspaces" 
          :key="workspace.id" 
          :workspace="workspace" 
        />
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl border-muted">
        <div class="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
          <Icon name="lucide:layout-grid" class="h-6 w-6" />
        </div>
        <h3 class="text-xl font-semibold">Nenhum workspace encontrado</h3>
        <p class="text-muted-foreground mb-6">Comece criando seu primeiro espaço financeiro.</p>
        <Button @click="isModalOpen = true">Criar Novo Workspace</Button>
      </div>
    </div>

    <!-- Modal de Criação -->
    <WorkspacesCreateWorkspaceModal 
      :open="isModalOpen" 
      @update:open="isModalOpen = $event"
      @success="refresh"
    />
  </div>
</template>