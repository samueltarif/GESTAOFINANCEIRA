import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    try {
        const client = await serverSupabaseClient<Database>(event)
        const user = await serverSupabaseUser(event)

        if (!user) {
            throw createError({ statusCode: 401, statusMessage: 'Usuário não autenticado' })
        }

        const query = getQuery(event)
        const workspaceId = query.workspace_id as string

        if (workspaceId) {
            // Se workspace_id for fornecido, filtrar por ele
            const { data, error } = await client
                .from('categories')
                .select('*')
                .eq('workspace_id', workspaceId)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('❌ Erro ao buscar categorias do workspace:', error)
                throw createError({ statusCode: 500, statusMessage: error.message })
            }

            return data || []
        } else {
            // Se não, buscar todas as categorias de todos os workspaces do usuário
            // CORREÇÃO: Usar user.id ou user.sub como fallback
            const userId = user.id || user.sub
            
            if (!userId) {
                console.error('❌ ERRO CRÍTICO: nem user.id nem user.sub estão disponíveis')
                throw createError({ statusCode: 401, statusMessage: 'ID do usuário não encontrado' })
            }
            
            // Primeiro buscar todos os workspaces do usuário
            const { data: workspaces } = await client
                .from('workspaces')
                .select('id')
                .eq('user_id', userId)

            const workspaceIds = (workspaces || []).map(w => w.id)

            if (workspaceIds.length === 0) {
                return []
            }

            // Buscar todas as categorias desses workspaces
            const { data, error } = await client
                .from('categories')
                .select('*')
                .in('workspace_id', workspaceIds)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('❌ Erro ao buscar todas as categorias:', error)
                throw createError({ statusCode: 500, statusMessage: error.message })
            }

            console.log(`✅ Categorias encontradas para usuário ${user.email}: ${data?.length || 0}`)
            return data || []
        }
    } catch (error: any) {
        console.error('❌ Erro na API categorias:', error)
        if (error.statusCode) {
            throw error
        }
        throw createError({ statusCode: 500, statusMessage: 'Erro interno do servidor' })
    }
})