import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    try {
        const client = await serverSupabaseClient<Database>(event)
        const user = await serverSupabaseUser(event)

        if (!user) {
            throw createError({ statusCode: 401, statusMessage: 'Usuário não autenticado' })
        }

        const body = await readBody(event)
        const { workspaceIds } = body

        if (!workspaceIds || !Array.isArray(workspaceIds) || workspaceIds.length === 0) {
            throw createError({ statusCode: 400, statusMessage: 'IDs dos workspaces são obrigatórios' })
        }

        const userId = user.id || user.sub
        
        if (!userId) {
            throw createError({ statusCode: 401, statusMessage: 'ID do usuário não encontrado' })
        }

        // Excluir múltiplos workspaces (CASCADE vai remover categories e transactions automaticamente)
        const { error } = await client
            .from('workspaces')
            .delete()
            .in('id', workspaceIds)
            .eq('user_id', userId)

        if (error) {
            console.error('❌ Erro ao excluir workspaces:', error)
            throw createError({ statusCode: 500, statusMessage: 'Erro ao excluir workspaces' })
        }

        return { 
            success: true, 
            message: `${workspaceIds.length} workspace(s) excluído(s) com sucesso`,
            count: workspaceIds.length
        }
    } catch (error: any) {
        console.error('❌ Erro na API delete multiple workspaces:', error)
        if (error.statusCode) {
            throw error
        }
        throw createError({ statusCode: 500, statusMessage: 'Erro interno do servidor' })
    }
})
