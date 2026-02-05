import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event)
    const user = await serverSupabaseUser(event)
    const query = getQuery(event)
    const workspaceId = query.workspace_id as string

    if (!user) {
        throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    if (!workspaceId) {
        throw createError({ statusCode: 400, message: 'workspace_id é obrigatório' })
    }

    const { data, error } = await client
        .from('accounts')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('name')

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    return data
})
