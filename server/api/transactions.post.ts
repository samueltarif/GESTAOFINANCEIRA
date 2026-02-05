import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    try {
        const client = await serverSupabaseClient<Database>(event)
        const user = await serverSupabaseUser(event)

        if (!user) {
            throw createError({ statusCode: 401, statusMessage: 'Usuário não autenticado' })
        }

        const body = await readBody(event)

        if (!body.account_id || !body.category_id || !body.type || !body.amount) {
            throw createError({ statusCode: 400, statusMessage: 'account_id, category_id, type e amount são obrigatórios' })
        }

        // CORREÇÃO: Usar user.id ou user.sub como fallback
        const userId = user.id || user.sub
        
        if (!userId) {
            console.error('❌ ERRO CRÍTICO: nem user.id nem user.sub estão disponíveis')
            throw createError({ statusCode: 401, statusMessage: 'ID do usuário não encontrado' })
        }

        // Verificar se a conta pertence ao usuário (contas globais)
        const { data: account } = await client
            .from('accounts')
            .select('id')
            .eq('id', body.account_id)
            .eq('user_id', userId)
            .single()

        if (!account) {
            throw createError({ statusCode: 403, statusMessage: 'Conta não encontrada ou não autorizada' })
        }

        const { data, error } = await client
            .from('transactions')
            .insert({
                account_id: body.account_id,
                category_id: body.category_id,
                type: body.type,
                amount: body.amount,
                description: body.description || '',
                date: body.date || new Date().toISOString().split('T')[0]
            })
            .select()
            .single()

        if (error) {
            console.error('❌ Erro ao criar transação:', error)
            throw createError({ statusCode: 500, statusMessage: error.message })
        }

        console.log(`✅ Transação criada para usuário ${user.email}: ${data.description}`)
        return data
    } catch (error: any) {
        console.error('❌ Erro na API criar transação:', error)
        if (error.statusCode) {
            throw error
        }
        throw createError({ statusCode: 500, statusMessage: 'Erro interno do servidor' })
    }
})