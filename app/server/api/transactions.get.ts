import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    const query = getQuery(event)
    const workspaceId = query.workspace_id as string

    // Se houver workspace_id, filtramos por ele (via accounts)
    let dbQuery = client.from('transactions').select(`
    *,
    accounts!inner(workspace_id)
  `)

    if (workspaceId) {
        dbQuery = dbQuery.eq('accounts.workspace_id', workspaceId)
    }

    const { data, error } = await dbQuery
        .order('date', { ascending: false })
        .limit(50)

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    return data
})
