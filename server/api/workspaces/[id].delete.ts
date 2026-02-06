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

        const userId = user.id || user.sub
        
        if (!userId) {
            throw createError({ statusCode: 401, statusMessage: 'ID do usuário não encontrado' })
        }

        // Verificar se o workspace pertence ao usuário
        const { data: workspace } = await client
            .from('workspaces')
            .select('id')
            .eq('id', workspaceId)
            .eq('user_id', userId)
            .single()

        if (!workspace) {
            throw createError({ statusCode: 404, statusMessage: 'Workspace não encontrado' })
        }

        // Excluir o workspace (CASCADE vai remover categories e transactions automaticamente)
        const { error } = await client
            .from('workspaces')
            .delete()
            .eq('id', workspaceId)
            .eq('user_id', userId)

        if (error) {
            console.error('❌ Erro ao excluir workspace:', error)
            throw createError({ statusCode: 500, statusMessage: 'Erro ao excluir workspace' })
        }

        return { success: true, message: 'Workspace excluído com sucesso' }
    } catch (error: any) {
        console.error('❌ Erro na API delete workspace:', error)
        if (error.statusCode) {
            throw error
        }
        throw createError({ statusCode: 500, statusMessage: 'Erro interno do servidor' })
    }
})
