<script setup lang="ts">
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardFooter from '@/components/ui/CardFooter.vue'

console.log('🚀 AUTHFORM.VUE: Componente carregado')

defineProps<{
  title: string
  description: string
}>()

const emit = defineEmits<{
  (e: 'submit'): void
}>()

function handleSubmit() {
  console.log('🚀 AUTHFORM.VUE: handleSubmit chamado')
  emit('submit')
  console.log('🚀 AUTHFORM.VUE: evento submit emitido')
}

onMounted(() => {
  console.log('🚀 AUTHFORM.VUE: Componente montado')
})
</script>

<template>
  <Card class="w-full max-w-md mx-auto">
    <CardHeader>
      <CardTitle class="text-2xl text-center">{{ title }}</CardTitle>
      <CardDescription class="text-center">{{ description }}</CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <slot name="fields" />
        <slot name="actions" />
      </form>
    </CardContent>
    <CardFooter v-if="$slots.footer" class="flex flex-col gap-2">
      <slot name="footer" />
    </CardFooter>
  </Card>
</template>
