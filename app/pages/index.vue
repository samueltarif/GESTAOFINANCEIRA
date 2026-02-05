<script setup lang="ts">
// Redireciona para login (sempre) - middleware de auth cuida do resto
await navigateTo('/login', { replace: true })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
  </div>
</template>
