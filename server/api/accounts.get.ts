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
        const userId = user.id || user.sub
        
        if (!userId) {
            throw createError({ statusCode: 401, statusMessage: 'ID do usuário não encontrado' })
        }

        // Obter o mês do filtro (opcional)
        const query = getQuery(event)
        const month = query.month as string

        // Buscar contas do usuário, filtrando por mês se fornecido
        let queryBuilder = supabase
            .from('accounts')
            .select('*')
            .eq('user_id', userId)

        // Se o mês foi fornecido, filtrar por ele
        if (month) {
            queryBuilder = queryBuilder.eq('month', month)
        }

        const { data, error } = await queryBuilder.order('created_at', { ascending: false })

        if (error) {
            console.error('❌ Erro ao buscar contas:', error)
            throw createError({ statusCode: 500, statusMessage: error.message })
        }

        return data || []
    } catch (error: any) {
        console.error('❌ Erro na API buscar contas:', error)
        if (error.statusCode) {
            throw error
        }
        throw createError({ statusCode: 500, statusMessage: 'Erro interno do servidor' })
    }
})
