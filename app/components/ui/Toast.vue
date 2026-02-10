<script setup lang="ts">
interface Props {
  show: boolean
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'success',
  duration: 3000
})

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const isVisible = ref(props.show)

watch(() => props.show, (newValue) => {
  if (newValue) {
    isVisible.value = true
    setTimeout(() => {
      isVisible.value = false
      emit('update:show', false)
    }, props.duration)
  }
})

const getIcon = () => {
  switch (props.type) {
    case 'success': return '✓'
    case 'error': return '✕'
    case 'warning': return '⚠'
    case 'info': return 'ℹ'
    default: return '✓'
  }
}

const getColors = () => {
  switch (props.type) {
    case 'success': return 'bg-green-500 border-green-600'
    case 'error': return 'bg-red-500 border-red-600'
    case 'warning': return 'bg-yellow-500 border-yellow-600'
    case 'info': return 'bg-blue-500 border-blue-600'
    default: return 'bg-green-500 border-green-600'
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="isVisible"
        class="fixed top-4 right-4 z-[9999] max-w-md"
      >
        <div
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border-l-4',
            getColors()
          ]"
        >
          <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white/20">
            <span class="text-white font-bold text-lg">{{ getIcon() }}</span>
          </div>
          <p class="text-white font-medium text-sm">{{ message }}</p>
          <button
            @click="isVisible = false; emit('update:show', false)"
            class="flex-shrink-0 ml-auto text-white/80 hover:text-white transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
