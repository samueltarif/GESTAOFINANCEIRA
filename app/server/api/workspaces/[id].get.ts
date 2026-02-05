import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event)
    const user = await serverSupabaseUser(event)
    const id = getRouterParam(event, 'id')

    if (!user) {
        throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    const { data, error } = await client
        .from('workspaces')
        .select('*')
        .eq('id', id || '')
        .eq('user_id', user.id)
        .single()

    if (error) {
        throw createError({ statusCode: 404, message: 'Workspace não encontrado' })
    }

    return data
})
