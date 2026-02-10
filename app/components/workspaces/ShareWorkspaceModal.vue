<script setup lang="ts">
// Tipos
interface Member {
  id: string
  user_id: string
  email: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  status: 'pending' | 'accepted' | 'rejected'
  invited_at: string
  accepted_at?: string
}

interface Props {
  workspaceId: string
  workspaceName: string
  open: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

// Estado
const members = ref<Member[]>([])
const loading = ref(false)
const inviteEmail = ref('')
const inviteRole = ref<'admin' | 'member' | 'viewer'>('member')
const inviting = ref(false)

// Computed
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

// Buscar membros
const fetchMembers = async () => {
  loading.value = true
  try {
    const data = await $fetch(`/api/workspaces/${props.workspaceId}/members`, {
      credentials: 'include'
    })
    members.value = data as Member[]
  } catch (error: any) {
    console.error('Erro ao buscar membros:', error)
  } finally {
    loading.value = false
  }
}

// Convidar membro
const inviteMember = async () => {
  if (!inviteEmail.value) return

  inviting.value = true
  try {
    await $fetch(`/api/workspaces/${props.workspaceId}/members`, {
      method: 'POST',
      body: {
        email: inviteEmail.value,
        role: inviteRole.value
      },
      credentials: 'include'
    })

    inviteEmail.value = ''
    inviteRole.value = 'member'
    await fetchMembers()
  } catch (error: any) {
    console.error('Erro ao convidar membro:', error)
    alert(error.data?.message || 'Erro ao convidar membro')
  } finally {
    inviting.value = false
  }
}

// Remover membro
const removeMember = async (memberId: string) => {
  if (!confirm('Tem certeza que deseja remover este membro?')) return

  try {
    await $fetch(`/api/workspaces/${props.workspaceId}/members/${memberId}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    await fetchMembers()
  } catch (error: any) {
    console.error('Erro ao remover membro:', error)
    alert(error.data?.message || 'Erro ao remover membro')
  }
}

// Alterar role
const changeRole = async (memberId: string, newRole: string) => {
  try {
    await $fetch(`/api/workspaces/${props.workspaceId}/members/${memberId}`, {
      method: 'PUT',
      body: { role: newRole },
      credentials: 'include'
    })
    await fetchMembers()
  } catch (error: any) {
    console.error('Erro ao alterar papel:', error)
    alert(error.data?.message || 'Erro ao alterar papel')
  }
}

// Tradução de roles
const roleLabels: Record<string, string> = {
  owner: 'Dono',
  admin: 'Administrador',
  member: 'Membro',
  viewer: 'Visualizador'
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  accepted: 'Aceito',
  rejected: 'Rejeitado'
}

// Carregar membros ao abrir
watch(() => props.open, (newValue) => {
  if (newValue) {
    fetchMembers()
  }
})
</script>

<template>
  <UiDialog v-model:open="isOpen">
    <UiDialogContent class="max-w-2xl max-h-[80vh] overflow-y-auto">
      <UiDialogHeader>
        <UiDialogTitle>Membros do Workspace</UiDialogTitle>
        <UiDialogDescription>
          Gerencie quem tem acesso ao workspace "{{ workspaceName }}"
        </UiDialogDescription>
      </UiDialogHeader>

      <div class="space-y-6">
        <!-- Formulário de convite -->
        <div class="border-b pb-4">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">Convidar Novo Membro</h3>
          <div class="flex gap-2">
            <input
              v-model="inviteEmail"
              type="email"
              placeholder="email@exemplo.com"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              @keyup.enter="inviteMember"
            />
            <select
              v-model="inviteRole"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="admin">Administrador</option>
              <option value="member">Membro</option>
              <option value="viewer">Visualizador</option>
            </select>
            <button
              @click="inviteMember"
              :disabled="!inviteEmail || inviting"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ inviting ? 'Enviando...' : 'Convidar' }}
            </button>
          </div>
        </div>

        <!-- Lista de membros -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 mb-3">Membros Atuais</h3>
          
          <!-- Loading -->
          <div v-if="loading" class="flex items-center justify-center py-8">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
          </div>

          <!-- Lista -->
          <div v-else-if="members.length > 0" class="space-y-2">
            <div
              v-for="member in members"
              :key="member.id"
              class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">{{ member.email }}</p>
                <p class="text-xs text-gray-500">
                  {{ roleLabels[member.role] }} • {{ statusLabels[member.status] }}
                </p>
              </div>

              <div class="flex items-center gap-2">
                <!-- Alterar role (só se não for owner) -->
                <select
                  v-if="member.role !== 'owner' && member.status === 'accepted'"
                  :value="member.role"
                  @change="changeRole(member.id, ($event.target as HTMLSelectElement).value)"
                  class="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="admin">Administrador</option>
                  <option value="member">Membro</option>
                  <option value="viewer">Visualizador</option>
                </select>

                <!-- Remover (só se não for owner) -->
                <button
                  v-if="member.role !== 'owner'"
                  @click="removeMember(member.id)"
                  class="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else class="text-center py-8 text-gray-500">
            Nenhum membro encontrado
          </div>
        </div>

        <!-- Informações sobre papéis -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-blue-900 mb-2">Papéis e Permissões</h4>
          <ul class="text-xs text-blue-800 space-y-1">
            <li><strong>Dono:</strong> Controle total do workspace</li>
            <li><strong>Administrador:</strong> Pode gerenciar membros e configurações</li>
            <li><strong>Membro:</strong> Pode criar e editar transações</li>
            <li><strong>Visualizador:</strong> Apenas visualização, sem edição</li>
          </ul>
        </div>
      </div>

      <UiDialogFooter>
        <button
          @click="isOpen = false"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Fechar
        </button>
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>
