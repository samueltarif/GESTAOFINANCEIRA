<script setup lang="ts">
interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div :class="['flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-0', props.class]">
    <slot />
  </div>
</template>