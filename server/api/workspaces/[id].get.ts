import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    try {
        const client = await serverSupabaseClient<Database>(event)
        const user = await serverSupabaseUser(event)

        if (!user) {
            throw createError({ statusCode: 401, statusMessage: 'Usuário não autenticado' })
        }

        const workspaceId = getRouterParam(event, 'id')

        if (!workspaceId) {
            throw createError({ statusCode: 400, statusMessage: 'ID do workspace é obrigatório' })
        }

        // Validar UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (!uuidRegex.test(workspaceId)) {
            throw createError({ statusCode: 400, statusMessage: 'ID do workspace inválido' })
        }

        // CORREÇÃO: Usar user.id ou user.sub como fallback
        const userId = user.id || user.sub
        
        if (!userId) {
            console.error('❌ ERRO CRÍTICO: nem user.id nem user.sub estão disponíveis')
            throw createError({ statusCode: 401, statusMessage: 'ID do usuário não encontrado' })
        }

        const { data, error } = await client
            .from('workspaces')
            .select('*')
            .eq('id', workspaceId)
            .eq('user_id', userId)
            .single()

        if (error) {
            console.error('❌ Erro ao buscar workspace:', error)
            throw createError({ statusCode: 500, statusMessage: error.message })
        }

        if (!data) {
            throw createError({ statusCode: 404, statusMessage: 'Workspace não encontrado' })
        }

        console.log(`✅ Workspace encontrado para usuário ${user.email}: ${data.name}`)
        return data
    } catch (error: any) {
        console.error('❌ Erro na API obter workspace:', error)
        if (error.statusCode) {
            throw error
        }
        throw createError({ statusCode: 500, statusMessage: 'Erro interno do servidor' })
    }
})