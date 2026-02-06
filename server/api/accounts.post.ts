import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    try {
        const user = await serverSupabaseUser(event)
        
        if (!user) {
            throw createError({ 
                statusCode: 401, 
                statusMessage: 'Usuário não autenticado' 
            })
        }

        const supabase = await serverSupabaseClient(event)
        const body = await readBody(event)

        if (!body.name || !body.type) {
            throw createError({ statusCode: 400, statusMessage: 'Nome e tipo são obrigatórios' })
        }

        if (!body.month) {
            throw createError({ statusCode: 400, statusMessage: 'Mês é obrigatório (formato: YYYY-MM)' })
        }

        const userId = user.id || user.sub
        
        if (!userId) {
            throw createError({ statusCode: 401, statusMessage: 'ID do usuário não encontrado' })
        }

        // Criar conta vinculada ao mês específico
        const { data, error } = await supabase
            .from('accounts')
            .insert({
                user_id: userId,
                name: body.name,
                type: body.type,
                balance: body.balance || 0,
                month: body.month  // Vincular ao mês (formato: YYYY-MM)
            })
            .select()
            .single()

        if (error) {
            console.error('❌ Erro ao criar conta:', error)
            throw createError({ statusCode: 500, statusMessage: error.message })
        }

        return data
    } catch (error: any) {
        console.error('❌ Erro na API criar conta:', error)
        if (error.statusCode) {
            throw error
        }
        throw createError({ statusCode: 500, statusMessage: 'Erro interno do servidor' })
    }
})
