import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    const body = await readBody(event)

    // Validação básica
    if (!body.name || !body.type) {
        throw createError({ statusCode: 400, message: 'Nome e tipo são obrigatórios' })
    }

    const { data, error } = await client
        .from('workspaces')
        .insert({
            user_id: user.id,
            name: body.name,
            type: body.type,
            currency: body.currency || 'BRL',
            color: body.color
        })
        .select()
        .single()

    if (error) {
        throw createError({ statusCode: 500, message: error.message })
    }

    return data
})
