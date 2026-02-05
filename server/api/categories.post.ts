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

        if (!body.name || !body.type || !body.workspace_id) {
            throw createError({ statusCode: 400, statusMessage: 'Nome, tipo e workspace_id são obrigatórios' })
        }

        // CORREÇÃO: Usar user.id ou user.sub como fallback
        const userId = user.id || user.sub
        
        if (!userId) {
            console.error('❌ ERRO CRÍTICO: nem user.id nem user.sub estão disponíveis')
            throw createError({ statusCode: 401, statusMessage: 'ID do usuário não encontrado' })
        }

        // Verificar se o workspace pertence ao usuário
        const { data: workspace } = await client
            .from('workspaces')
            .select('id')
            .eq('id', body.workspace_id)
            .eq('user_id', userId)
            .single()

        if (!workspace) {
            throw createError({ statusCode: 403, statusMessage: 'Workspace não encontrado ou não autorizado' })
        }

        const { data, error } = await client
            .from('categories')
            .insert({
                workspace_id: body.workspace_id,
                name: body.name,
                type: body.type,
                color: body.color || '#94a3b8'
            })
            .select()
            .single()

        if (error) {
            console.error('❌ Erro ao criar categoria:', error)
            throw createError({ statusCode: 500, statusMessage: error.message })
        }

        console.log(`✅ Categoria criada para usuário ${user.email}: ${data.name}`)
        return data
    } catch (error: any) {
        console.error('❌ Erro na API criar categoria:', error)
        if (error.statusCode) {
            throw error
        }
        throw createError({ statusCode: 500, statusMessage: 'Erro interno do servidor' })
    }
})