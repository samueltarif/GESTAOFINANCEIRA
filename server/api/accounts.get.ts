import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    try {
        // Obter usuário autenticado
        const user = await serverSupabaseUser(event)
        
        if (!user) {
            throw createError({ 
                statusCode: 401, 
                statusMessage: 'Usuário não autenticado' 
            })
        }

        const client = await serverSupabaseClient<Database>(event)
        
        // CORREÇÃO: Usar user.id ou user.sub como fallback
        const userId = user.id || user.sub
        
        if (!userId) {
            console.error('❌ ERRO CRÍTICO: nem user.id nem user.sub estão disponíveis')
            throw createError({ statusCode: 401, statusMessage: 'ID do usuário não encontrado' })
        }
        
        console.log('🔍 Usando userId para accounts:', userId)
        
        // Buscar TODAS as contas do usuário autenticado (globais)
        const { data, error } = await client
            .from('accounts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('❌ Erro ao buscar contas globais:', error)
            throw createError({ statusCode: 500, statusMessage: error.message })
        }

        console.log(`✅ Contas globais encontradas para usuário ${user.email}: ${data?.length || 0}`)
        return data || []
    } catch (error: any) {
        console.error('❌ Erro na API contas globais:', error)
        if (error.statusCode) {
            throw error
        }
        throw createError({ statusCode: 500, statusMessage: 'Erro interno do servidor' })
    }
})