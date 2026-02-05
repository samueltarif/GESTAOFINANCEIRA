import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

// API permanente para criar contas globais do usuário autenticado
// Substitui a API accounts-global-bypass.post.ts

export default defineEventHandler(async (event) => {
    try {
        // Obter usuário autenticado
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

        // CORREÇÃO: Usar user.id ou user.sub como fallback
        const userId = user.id || user.sub
        
        if (!userId) {
            console.error('❌ ERRO CRÍTICO: nem user.id nem user.sub estão disponíveis')
            throw createError({ statusCode: 401, statusMessage: 'ID do usuário não encontrado' })
        }

        // Criar conta GLOBAL para o usuário autenticado
        const { data, error } = await supabase
            .from('accounts')
            .insert({
                user_id: userId,  // Usuário autenticado
                workspace_id: body.workspace_id || null,  // Opcional (referência)
                name: body.name,
                type: body.type,
                balance: body.balance || 0
            })
            .select()
            .single()

        if (error) {
            console.error('❌ Erro ao criar conta global:', error)
            throw createError({ statusCode: 500, statusMessage: error.message })
        }


        return data
    } catch (error: any) {
        console.error('❌ Erro na API criar conta global:', error)
        if (error.statusCode) {
            throw error
        }
        throw createError({ statusCode: 500, statusMessage: 'Erro interno do servidor' })
    }
})
