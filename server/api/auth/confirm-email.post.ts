import { createClient } from '@supabase/supabase-js'

// API para confirmar emails automaticamente (desenvolvimento)
// Em produção, configure SMTP no Supabase para envio automático

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        
        if (!body.email) {
            throw createError({ statusCode: 400, statusMessage: 'Email é obrigatório' })
        }

        // Cliente admin para operações administrativas
        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Buscar usuário pelo email
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        
        if (listError) {
            console.error('❌ Erro ao listar usuários:', listError)
            throw createError({ statusCode: 500, statusMessage: 'Erro interno do servidor' })
        }

        const user = users.users.find(u => u.email === body.email)
        
        if (!user) {
            throw createError({ statusCode: 404, statusMessage: 'Usuário não encontrado' })
        }

        if (user.email_confirmed_at) {
            return { message: 'Email já confirmado', confirmed: true }
        }

        // Confirmar email
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
            user.sub,
            { 
                email_confirm: true,
                email_confirmed_at: new Date().toISOString()
            }
        )

        if (error) {
            console.error('❌ Erro ao confirmar email:', error)
            throw createError({ statusCode: 500, statusMessage: 'Erro ao confirmar email' })
        }


        
        return { 
            message: 'Email confirmado com sucesso', 
            confirmed: true,
            user: {
                id: data.user.sub,
                email: data.user.email,
                email_confirmed_at: data.user.email_confirmed_at
            }
        }
    } catch (error: any) {
        console.error('❌ Erro na API confirmar email:', error)
        if (error.statusCode) {
            throw error
        }
        throw createError({ statusCode: 500, statusMessage: 'Erro interno do servidor' })
    }
})
