<script setup lang="ts">
interface Props {
  open?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open || false,
  set: (value) => emit('update:open', value)
})
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 bg-black/50" 
      @click="isOpen = false"
    ></div>
    
    <!-- Dialog -->
    <div class="relative bg-background rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
      <slot />
    </div>
  </div>
</template>