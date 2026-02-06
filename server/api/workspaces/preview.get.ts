import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    try {
        const client = await serverSupabaseClient<Database>(event)
        const user = await serverSupabaseUser(event)

        if (!user) {
            throw createError({ statusCode: 401, statusMessage: 'Usuário não autenticado' })
        }

        const userId = user.id || user.sub
        
        if (!userId) {
            throw createError({ statusCode: 401, statusMessage: 'ID do usuário não encontrado' })
        }

        // Buscar todos os workspaces do usuário
        const { data: workspaces } = await client
            .from('workspaces')
            .select('id, name, type, color, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (!workspaces || workspaces.length === 0) {
            return []
        }

        // Para cada workspace, buscar prévia dos dados
        const previews = await Promise.all(
            workspaces.map(async (workspace) => {
                // Buscar categorias do workspace
                const { data: categories } = await client
                    .from('categories')
                    .select('id')
                    .eq('workspace_id', workspace.id)

                const categoryIds = categories?.map(c => c.id) || []

                let totalRevenue = 0
                let totalExpenses = 0
                let transactionCount = 0

                if (categoryIds.length > 0) {
                    // Buscar receitas
                    const { data: revenues } = await client
                        .from('transactions')
                        .select('amount')
                        .ilike('type', 'revenue')
                        .in('category_id', categoryIds)

                    totalRevenue = revenues?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0

                    // Buscar despesas
                    const { data: expenses } = await client
                        .from('transactions')
                        .select('amount')
                        .ilike('type', 'expense')
                        .in('category_id', categoryIds)

                    totalExpenses = expenses?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0

                    // Contar transações
                    const { count } = await client
                        .from('transactions')
                        .select('id', { count: 'exact', head: true })
                        .in('category_id', categoryIds)

                    transactionCount = count || 0
                }

                // Buscar contas (globais do usuário, mas vamos contar todas)
                const { count: accountCount } = await client
                    .from('accounts')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', userId)

                // Calcular saldo (receitas - despesas)
                const balance = totalRevenue - totalExpenses

                return {
                    ...workspace,
                    preview: {
                        balance,
                        totalRevenue,
                        totalExpenses,
                        accountCount: accountCount || 0,
                        transactionCount,
                        categoryCount: categoryIds.length,
                        hasData: transactionCount > 0 || categoryIds.length > 0
                    }
                }
            })
        )

        return previews
    } catch (error: any) {
        console.error('❌ Erro na API workspaces preview:', error)
        if (error.statusCode) {
            throw error
        }
        throw createError({ statusCode: 500, statusMessage: 'Erro interno do servidor' })
    }
})
