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

        const body = await readBody(event)
        const { name, color } = body

        if (!name || !name.trim()) {
            throw createError({ statusCode: 400, statusMessage: 'Nome do workspace é obrigatório' })
        }

        if (!color || !color.match(/^#[0-9A-F]{6}$/i)) {
            throw createError({ statusCode: 400, statusMessage: 'Cor inválida (use formato hexadecimal #RRGGBB)' })
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

        // Atualizar o workspace
        const { data, error } = await client
            .from('workspaces')
            .update({
                name: name.trim(),
                color: color.toUpperCase()
            })
            .eq('id', workspaceId)
            .eq('user_id', userId)
            .select()
            .single()

        if (error) {
            console.error('❌ Erro ao atualizar workspace:', error)
            throw createError({ statusCode: 500, statusMessage: 'Erro ao atualizar workspace' })
        }

        return { success: true, data }
    } catch (error: any) {
        console.error('❌ Erro na API update workspace:', error)
        if (error.statusCode) {
            throw error
        }
        throw createError({ statusCode: 500, statusMessage: 'Erro interno do servidor' })
    }
})
