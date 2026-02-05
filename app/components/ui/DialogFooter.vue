<script setup lang="ts">
interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div :class="['flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0', props.class]">
    <slot />
  </div>
</template>