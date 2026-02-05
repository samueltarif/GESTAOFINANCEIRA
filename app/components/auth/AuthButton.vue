<script setup lang="ts">
import Button from '@/components/ui/Button.vue'

defineProps<{
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()
</script>

<template>
  <Button
    :type="type || 'submit'"
    class="w-full"
    :disabled="loading"
  >
    <template v-if="loading">
      <span class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
      Carregando...
    </template>
    <slot v-else />
  </Button>
</template>
