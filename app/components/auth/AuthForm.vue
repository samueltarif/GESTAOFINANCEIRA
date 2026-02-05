<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()

defineEmits<{
  (e: 'submit'): void
}>()
</script>

<template>
  <UiCard class="w-full max-w-md mx-auto">
    <UiCardHeader>
      <UiCardTitle class="text-2xl text-center">{{ title }}</UiCardTitle>
      <UiCardDescription class="text-center">{{ description }}</UiCardDescription>
    </UiCardHeader>
    <UiCardContent>
      <form @submit.prevent="$emit('submit')" class="space-y-4">
        <slot name="fields" />
        <slot name="actions" />
      </form>
    </UiCardContent>
    <UiCardFooter v-if="$slots.footer" class="flex flex-col gap-2">
      <slot name="footer" />
    </UiCardFooter>
  </UiCard>
</template>
