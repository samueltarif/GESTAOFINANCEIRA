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

        // Validar UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (!uuidRegex.test(workspaceId)) {
            throw createError({ statusCode: 400, statusMessage: 'ID do workspace inválido' })
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
            .select('id, name')
            .eq('id', workspaceId)
            .eq('user_id', userId)
            .single()

        if (!workspace) {
            throw createError({ statusCode: 404, statusMessage: 'Workspace não encontrado' })
        }

        // Buscar todas as contas GLOBAIS do usuário (após migração)
        const { data: accounts } = await client
            .from('accounts')
            .select('id, balance')
            .eq('user_id', userId)

        const accountIds = (accounts || []).map(a => a.id)
        const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0

        // Buscar categorias do workspace específico
        const { data: categories } = await client
            .from('categories')
            .select('id, name, color, type')
            .eq('workspace_id', workspaceId)

        const categoryMap = new Map(categories?.map(c => [c.id, c]) || [])

        // Buscar transações através das contas globais
        let transactions: any[] = []
        if (accountIds.length > 0) {
            const { data: txs } = await client
                .from('transactions')
                .select('*')
                .in('account_id', accountIds)
                .order('date', { ascending: false })

            transactions = txs || []
        }

        // Cálculos específicos do workspace
        let totalRevenue = 0
        let totalExpenses = 0
        const expensesByCategory: Record<string, number> = {}

        transactions.forEach(tx => {
            // Filtrar apenas transações das categorias deste workspace
            const category = categoryMap.get(tx.category_id)
            if (!category) return

            if (tx.type === 'revenue') {
                totalRevenue += tx.amount
            } else {
                totalExpenses += tx.amount
                const catId = tx.category_id || 'unassigned'
                expensesByCategory[catId] = (expensesByCategory[catId] || 0) + tx.amount
            }
        })

        const profit = totalRevenue - totalExpenses

        // Preparar dados para o gráfico de pizza
        const expenseLabels: string[] = []
        const expenseData: number[] = []
        const expenseColors: string[] = []

        Object.entries(expensesByCategory).forEach(([catId, total]) => {
            const cat = categoryMap.get(catId)
            expenseLabels.push(cat?.name || 'Vários')
            expenseData.push(total)
            expenseColors.push(cat?.color || '#94a3b8')
        })

        // Evolução mensal (últimos 6 meses)
        const now = new Date()
        const monthLabels: string[] = []
        const monthlyRevenues: number[] = []
        const monthlyExpenses: number[] = []

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            monthLabels.push(d.toLocaleDateString('pt-BR', { month: 'short' }))

            let rev = 0, exp = 0
            transactions.forEach(tx => {
                const category = categoryMap.get(tx.category_id)
                if (!category) return

                if (tx.date.startsWith(monthKey)) {
                    if (tx.type === 'revenue') rev += tx.amount
                    else exp += tx.amount
                }
            })
            monthlyRevenues.push(rev)
            monthlyExpenses.push(exp)
        }

        // Transações recentes do workspace
        const recentTransactions = transactions
            .filter(tx => categoryMap.has(tx.category_id))
            .slice(0, 10)
            .map(tx => ({
                id: tx.id,
                date: tx.date,
                description: tx.description || '',
                category: categoryMap.get(tx.category_id)?.name || 'Sem categoria',
                type: tx.type,
                amount: tx.amount
            }))

        console.log(`✅ Dashboard do workspace ${workspace.name} calculado para usuário ${user.email}`)

        return {
            workspace: workspace,
            totalBalance,
            totalRevenue,
            totalExpenses,
            profit,
            expensesByCategory: {
                labels: expenseLabels,
                data: expenseData,
                colors: expenseColors
            },
            monthlyEvolution: {
                labels: monthLabels,
                revenues: monthlyRevenues,
                expenses: monthlyExpenses
            },
            recentTransactions
        }
    } catch (error: any) {
        console.error('❌ Erro na API dashboard workspace:', error)
        if (error.statusCode) {
            throw error
        }
        throw createError({ statusCode: 500, statusMessage: 'Erro interno do servidor' })
    }
})