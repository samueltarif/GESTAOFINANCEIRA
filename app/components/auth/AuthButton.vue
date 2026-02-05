<script setup lang="ts">
import Button from '@/components/ui/Button.vue'

console.log('🚀 AUTHBUTTON.VUE: Componente carregado')

defineProps<{
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()

function handleClick() {
  console.log('🚀 AUTHBUTTON.VUE: Botão clicado!')
}

onMounted(() => {
  console.log('🚀 AUTHBUTTON.VUE: Componente montado')
})
</script>

<template>
  <Button
    :type="type || 'submit'"
    class="w-full"
    :disabled="loading"
    @click="handleClick"
  >
    <template v-if="loading">
      <span class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
      Carregando...
    </template>
    <slot v-else />
  </Button>
</template>
