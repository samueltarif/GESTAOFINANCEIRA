<script setup lang="ts">
const { toastState } = useToast()
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <UiToast
      v-model:show="toastState.show"
      :message="toastState.message"
      :type="toastState.type"
    />
  </div>
</template>
