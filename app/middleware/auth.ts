// Middleware otimizado - não bloqueia a UI
export default defineNuxtRouteMiddleware(async (to, from) => {
    // Verificação client-side apenas
    if (process.client) {
        const user = useSupabaseUser()
        
        // Permite navegação imediata, verifica depois
        if (!user.value) {
            return navigateTo('/login')
        }
    }
    
    // No servidor, verificação rápida
    if (process.server) {
        const user = useSupabaseUser()
        if (!user.value) {
            return navigateTo('/login')
        }
    }
})
