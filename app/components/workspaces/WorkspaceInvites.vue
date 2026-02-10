<script setup lang="ts">
// Tipos
interface Invite {
  id: string
  workspace_id: string
  workspace_name: string
  workspace_type: string
  role: string
  invited_at: string
  invited_by_email: string
}

// Estado
const invites = ref<Invite[]>([])
const loading = ref(false)

// Buscar convites
const fetchInvites = async () => {
  loading.value = true
  try {
    const data = await $fetch('/api/workspace-invites', {
      credentials: 'include'
    })
    invites.value = data as Invite[]
  } catch (error) {
    console.error('Erro ao buscar convites:', error)
  } finally {
    loading.value = false
  }
}

// Aceitar convite
const acceptInvite = async (invite: Invite) => {
  try {
    await $fetch(`/api/workspaces/${invite.workspace_id}/members/${invite.id}`, {
      method: 'PUT',
      body: { status: 'accepted' },
      credentials: 'include'
    })
    await fetchInvites()
    // Recarregar workspaces
    window.location.reload()
  } catch (error: any) {
    console.error('Erro ao aceitar convite:', error)
    alert(error.data?.message || 'Erro ao aceitar convite')
  }
}

// Rejeitar convite
const rejectInvite = async (invite: Invite) => {
  try {
    await $fetch(`/api/workspaces/${invite.workspace_id}/members/${invite.id}`, {
      method: 'PUT',
      body: { status: 'rejected' },
      credentials: 'include'
    })
    await fetchInvites()
  } catch (error: any) {
    console.error('Erro ao rejeitar convite:', error)
    alert(error.data?.message || 'Erro ao rejeitar convite')
  }
}

// Tradução de roles
const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  member: 'Membro',
  viewer: 'Visualizador'
}

// Carregar ao montar
onMounted(() => {
  fetchInvites()
})
</script>

<template>
  <div v-if="invites.length > 0" class="mb-6">
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 class="text-sm font-semibold text-blue-900 mb-3">
        📬 Convites Pendentes ({{ invites.length }})
      </h3>
      
      <div class="space-y-2">
        <div
          v-for="invite in invites"
          :key="invite.id"
          class="bg-white border border-blue-200 rounded-lg p-3 flex items-center justify-between"
        >
          <div>
            <p class="text-sm font-medium text-gray-900">{{ invite.workspace_name }}</p>
            <p class="text-xs text-gray-600">
              Convidado por {{ invite.invited_by_email }} como {{ roleLabels[invite.role] }}
            </p>
          </div>
          
          <div class="flex gap-2">
            <button
              @click="acceptInvite(invite)"
              class="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
            >
              Aceitar
            </button>
            <button
              @click="rejectInvite(invite)"
              class="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Rejeitar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
