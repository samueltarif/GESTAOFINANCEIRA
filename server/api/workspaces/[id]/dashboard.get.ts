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

        // Obter filtros de data da query (formato: YYYY-MM)
        const query = getQuery(event)
        const monthFilter = query.month as string
        
        let startDate: string
        let endDate: string
        
        if (monthFilter) {
            const [year, month] = monthFilter.split('-')
            startDate = `${year}-${month}-01`
            const nextMonth = new Date(parseInt(year), parseInt(month), 1)
            endDate = nextMonth.toISOString().split('T')[0]
        } else {
            const now = new Date()
            const year = now.getFullYear()
            const month = String(now.getMonth() + 1).padStart(2, '0')
            startDate = `${year}-${month}-01`
            const nextMonth = new Date(year, now.getMonth() + 1, 1)
            endDate = nextMonth.toISOString().split('T')[0]
        }

        // Validar UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (!uuidRegex.test(workspaceId)) {
            throw createError({ statusCode: 400, statusMessage: 'ID do workspace inválido' })
        }

        const userId = user.id || user.sub
        
        if (!userId) {
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

        // Buscar TODOS os workspaces do usuário
        const { data: allWorkspaces } = await client
            .from('workspaces')
            .select('id')
            .eq('user_id', userId)

        const workspaceIds = (allWorkspaces || []).map(w => w.id)

        // Buscar TODAS as categorias de TODOS os workspaces do usuário (não apenas do workspace atual)
        const { data: categories } = await client
            .from('categories')
            .select('id, name, color, type')
            .in('workspace_id', workspaceIds)

        const categoryMap = new Map(categories?.map(c => [c.id, c]) || [])
        const allCategoryIds = Array.from(categoryMap.keys())

        // Buscar categorias apenas do workspace atual (para transações recentes)
        const { data: workspaceCategories } = await client
            .from('categories')
            .select('id')
            .eq('workspace_id', workspaceId)

        const workspaceCategoryIds = (workspaceCategories || []).map(c => c.id)

        if (allCategoryIds.length === 0) {
            // Buscar saldo das contas mesmo sem categorias
            const { data: accounts } = await client
                .from('accounts')
                .select('balance')
                .eq('user_id', userId)
                .eq('month', monthFilter || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`)

            const currentAccountBalance = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0

            return {
                workspace,
                currentAccountBalance,
                totalRevenue: 0,
                totalExpenses: 0,
                profit: currentAccountBalance,
                expensesByCategory: { labels: [], data: [], colors: [] },
                monthlyEvolution: { labels: [], revenues: [], expenses: [] },
                recentTransactions: []
            }
        }

        // EXECUTAR TODAS AS QUERIES EM PARALELO
        const [
            accountsResult,
            revenueResult,
            expenseResult,
            recentTxsResult
        ] = await Promise.all([
            // Saldo das contas
            client
                .from('accounts')
                .select('balance')
                .eq('user_id', userId)
                .eq('month', monthFilter || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`),
            
            // Receitas do mês (TODAS as categorias do usuário)
            client
                .from('transactions')
                .select('amount, category_id')
                .ilike('type', 'revenue')
                .in('category_id', allCategoryIds)
                .gte('date', startDate)
                .lt('date', endDate),
            
            // Despesas do mês (TODAS as categorias do usuário)
            client
                .from('transactions')
                .select('amount, category_id')
                .ilike('type', 'expense')
                .in('category_id', allCategoryIds)
                .gte('date', startDate)
                .lt('date', endDate),
            
            // Transações recentes (apenas do workspace atual)
            client
                .from('transactions')
                .select('id, date, description, category_id, account_id, type, amount')
                .in('category_id', workspaceCategoryIds.length > 0 ? workspaceCategoryIds : ['00000000-0000-0000-0000-000000000000'])
                .gte('date', startDate)
                .lt('date', endDate)
                .order('date', { ascending: false })
                .limit(10)
        ])

        const currentAccountBalance = accountsResult.data?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0
        const totalRevenue = revenueResult.data?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0

        let totalExpenses = 0
        const expensesByCategory: Record<string, number> = {}

        expenseResult.data?.forEach(tx => {
            totalExpenses += tx.amount || 0
            const catId = tx.category_id || 'unassigned'
            expensesByCategory[catId] = (expensesByCategory[catId] || 0) + (tx.amount || 0)
        })

        const profit = currentAccountBalance + totalRevenue - totalExpenses

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

        // Evolução mensal SIMPLIFICADA (apenas 3 meses ao invés de 6)
        const now = new Date()
        const monthLabels: string[] = []
        const monthlyRevenues: number[] = []
        const monthlyExpenses: number[] = []

        // Buscar evolução mensal em paralelo
        const evolutionPromises = []
        for (let i = 2; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthStart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString().split('T')[0]
            
            monthLabels.push(d.toLocaleDateString('pt-BR', { month: 'short' }))

            evolutionPromises.push(
                Promise.all([
                    client
                        .from('transactions')
                        .select('amount, category_id')
                        .ilike('type', 'revenue')
                        .in('category_id', allCategoryIds)
                        .gte('date', monthStart)
                        .lt('date', monthEnd),
                    client
                        .from('transactions')
                        .select('amount, category_id')
                        .ilike('type', 'expense')
                        .in('category_id', allCategoryIds)
                        .gte('date', monthStart)
                        .lt('date', monthEnd)
                ])
            )
        }

        const evolutionResults = await Promise.all(evolutionPromises)
        
        evolutionResults.forEach(([revenueRes, expenseRes]) => {
            // Filtrar apenas transações de categorias do usuário
            let rev = 0
            let exp = 0
            
            revenueRes.data?.forEach(tx => {
                if (categoryMap.has(tx.category_id)) {
                    rev += tx.amount || 0
                }
            })
            
            expenseRes.data?.forEach(tx => {
                if (categoryMap.has(tx.category_id)) {
                    exp += tx.amount || 0
                }
            })
            
            monthlyRevenues.push(rev)
            monthlyExpenses.push(exp)
        })

        const recentTransactions = (recentTxsResult.data || []).map(tx => ({
            id: tx.id,
            date: tx.date,
            description: tx.description || '',
            category: categoryMap.get(tx.category_id)?.name || 'Sem categoria',
            category_id: tx.category_id,
            account_id: tx.account_id,
            type: tx.type,
            amount: tx.amount
        }))

        return {
            workspace,
            currentAccountBalance,
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
