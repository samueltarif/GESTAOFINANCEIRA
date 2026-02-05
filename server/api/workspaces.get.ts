import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    try {
        const client = await serverSupabaseClient<Database>(event)
        const user = await serverSupabaseUser(event)

        if (!user) {
            throw createError({ statusCode: 401, statusMessage: 'Usuário não autenticado' })
        }

        console.log('🔍 === DEBUG WORKSPACES API ===')
        console.log('User object:', user)
        console.log('User ID:', user?.id)
        console.log('User sub:', user?.sub)
        console.log('User email:', user?.email)

        // CORREÇÃO: Usar user.sub ou user.sub como fallback
        const userId = user.sub || user.sub
        
        if (!userId) {
            console.error('❌ ERRO CRÍTICO: nem user.sub nem user.sub estão disponíveis')
            console.error('❌ User object completo:', JSON.stringify(user, null, 2))
            throw createError({ statusCode: 401, statusMessage: 'ID do usuário não encontrado' })
        }
        
        console.log('🔍 Usando userId:', userId)

        const { data, error } = await client
            .from('workspaces')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('❌ Erro na query workspaces:', error)
            throw createError({ statusCode: 500, statusMessage: error.message })
        }

        console.log(`✅ Workspaces encontrados: ${data?.length || 0}`)
        return data || []
    } catch (error: any) {
        console.error('❌ Erro na API workspaces:', error)
        if (error.statusCode) {
            throw error
        }
        throw createError({ statusCode: 500, statusMessage: 'Erro interno do servidor' })
    }
})