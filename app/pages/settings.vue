<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const user = useSupabaseUser()

// Estados
const activeTab = ref<'accounts' | 'categories'>('accounts')
const showEditAccountModal = ref(false)
const showEditCategoryModal = ref(false)
const selectedAccount = ref<any>(null)
const selectedCategory = ref<any>(null)
const selectedWorkspace = ref('')

// Buscar workspaces
const { data: workspaces, refresh: refreshWorkspaces } = await useFetch('/api/workspaces')

// Buscar contas
const { data: accounts, refresh: refreshAccounts } = await useFetch('/api/accounts')

// Buscar categorias do workspace selecionado
const { data: categories, refresh: refreshCategories } = await useFetch(() => 
  selectedWorkspace.value ? `/api/categories?workspace_id=${selectedWorkspace.value}` : null
)

// Selecionar primeiro workspace por padrão
watch(workspaces, (newWorkspaces) => {
  if (newWorkspaces && newWorkspaces.length > 0 && !selectedWorkspace.value) {
    selectedWorkspace.value = newWorkspaces[0].id
  }
}, { immediate: true })

// Atualizar categorias quando workspace mudar
watch(selectedWorkspace, () => {
  refreshCategories()
})

const editAccount = (account: any) => {
  selectedAccount.value = account
  showEditAccountModal.value = true
}

const editCategory = (category: any) => {
  selectedCategory.value = category
  showEditCategoryModal.value = true
}

const handleAccountSuccess = () => {
  refreshAccounts()
}

const handleCategorySuccess = () => {
  refreshCategories()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />
    
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Título -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">⚙️ Configurações</h1>
        <p class="text-gray-600 mt-2">Gerencie suas contas e categorias</p>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="flex border-b border-gray-200">
          <button
            @click="activeTab = 'accounts'"
            class="flex-1 px-6 py-4 text-sm font-medium transition-colors"
            :class="activeTab === 'accounts' 
              ? 'text-green-600 border-b-2 border-green-600 bg-green-50' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'"
          >
            💳 Contas
          </button>
          <button
            @click="activeTab = 'categories'"
            class="flex-1 px-6 py-4 text-sm font-medium transition-colors"
            :class="activeTab === 'categories' 
              ? 'text-green-600 border-b-2 border-green-600 bg-green-50' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'"
          >
            🏷️ Categorias
          </button>
        </div>
      </div>

      <!-- Conteúdo das Tabs -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <!-- Tab: Contas -->
        <div v-if="activeTab === 'accounts'">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Minhas Contas</h2>
          </div>

          <div v-if="accounts && accounts.length > 0" class="space-y-3">
            <div
              v-for="account in accounts"
              :key="account.id"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <div>
                <h3 class="font-medium text-gray-900">{{ account.name }}</h3>
                <p class="text-sm text-gray-600">
                  Saldo: <span class="font-semibold" :class="account.balance >= 0 ? 'text-green-600' : 'text-red-600'">
                    R$ {{ account.balance.toFixed(2) }}
                  </span>
                </p>
              </div>
              <button
                @click="editAccount(account)"
                class="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
              >
                ✏️ Editar
              </button>
            </div>
          </div>

          <div v-else class="text-center py-12">
            <p class="text-gray-500">Nenhuma conta cadastrada</p>
          </div>
        </div>

        <!-- Tab: Categorias -->
        <div v-if="activeTab === 'categories'">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Categorias</h2>
            <select
              v-model="selectedWorkspace"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Selecione um workspace</option>
              <option v-for="workspace in workspaces" :key="workspace.id" :value="workspace.id">
                {{ workspace.name }}
              </option>
            </select>
          </div>

          <div v-if="categories && categories.length > 0" class="space-y-3">
            <div
              v-for="category in categories"
              :key="category.id"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-full"
                  :style="{ backgroundColor: category.color }"
                ></div>
                <div>
                  <h3 class="font-medium text-gray-900">{{ category.name }}</h3>
                  <p class="text-sm text-gray-600">
                    {{ category.type === 'revenue' ? '💰 Receita' : '💸 Despesa' }}
                  </p>
                </div>
              </div>
              <button
                @click="editCategory(category)"
                class="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
              >
                ✏️ Editar
              </button>
            </div>
          </div>

          <div v-else-if="selectedWorkspace" class="text-center py-12">
            <p class="text-gray-500">Nenhuma categoria cadastrada neste workspace</p>
          </div>

          <div v-else class="text-center py-12">
            <p class="text-gray-500">Selecione um workspace para ver as categorias</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modais -->
    <EditAccountModal
      v-model:open="showEditAccountModal"
      :account="selectedAccount"
      @success="handleAccountSuccess"
    />

    <EditCategoryModal
      v-model:open="showEditCategoryModal"
      :category="selectedCategory"
      :workspace-id="selectedWorkspace"
      @success="handleCategorySuccess"
    />
  </div>
</template>
