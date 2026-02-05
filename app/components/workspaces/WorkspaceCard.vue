<script setup lang="ts">
interface Workspace {
  id: string
  name: string
  type: 'personal' | 'business' | 'investment'
  currency: string
  color: string
  created_at: string
}

interface Props {
  workspace: Workspace
}

const props = defineProps<Props>()

const getTypeLabel = (type: string) => {
  const labels = {
    personal: 'Pessoal',
    business: 'Negócios',
    investment: 'Investimentos'
  }
  return labels[type as keyof typeof labels] || type
}

const getTypeIcon = (type: string) => {
  const icons = {
    personal: 'lucide:user',
    business: 'lucide:briefcase',
    investment: 'lucide:trending-up'
  }
  return icons[type as keyof typeof icons] || 'lucide:folder'
}
</script>

<template>
  <Card class="hover:shadow-md transition-shadow cursor-pointer">
    <NuxtLink :to="`/workspaces/${workspace.id}`" class="block p-6">
      <div class="flex items-start justify-between">
        <div class="flex items-center space-x-3">
          <div 
            class="w-4 h-4 rounded-full flex-shrink-0" 
            :style="{ backgroundColor: workspace.color }"
          ></div>
          <div>
            <h3 class="font-semibold text-lg">{{ workspace.name }}</h3>
            <div class="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
              <Icon :name="getTypeIcon(workspace.type)" class="w-4 h-4" />
              <span>{{ getTypeLabel(workspace.type) }}</span>
              <span>•</span>
              <span>{{ workspace.currency }}</span>
            </div>
          </div>
        </div>
        
        <Icon name="lucide:chevron-right" class="w-5 h-5 text-muted-foreground" />
      </div>
      
      <div class="mt-4 text-sm text-muted-foreground">
        Criado em {{ new Date(workspace.created_at).toLocaleDateString('pt-BR') }}
      </div>
    </NuxtLink>
  </Card>
</template>