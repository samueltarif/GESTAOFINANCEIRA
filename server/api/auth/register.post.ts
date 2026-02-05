import { serverSupabaseClient } from '#supabase/server'

/**
 * 📧 API para registro de novos usuários com confirmação por email
 * 
 * Esta API cria novos usuários e envia email de confirmação
 */

export default defineEventHandler(async (event) => {
    try {
        const supabase = await serverSupabaseClient(event)
        const body = await readBody(event)
        
        if (!body.email || !body.password) {
            throw createError({ 
                statusCode: 400, 
                statusMessage: 'Email e senha são obrigatórios' 
            })
        }

        // Validar formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(body.email)) {
            throw createError({ 
                statusCode: 400, 
                statusMessage: 'Formato de email inválido' 
            })
        }

        // Validar força da senha
        if (body.password.length < 6) {
            throw createError({ 
                statusCode: 400, 
                statusMessage: 'Senha deve ter pelo menos 6 caracteres' 
            })
        }

        console.log('📧 Criando usuário com confirmação de email:', body.email)

        // Criar usuário com confirmação de email
        const { data, error } = await supabase.auth.signUp({
            email: body.email,
            password: body.password,
            options: {
                emailRedirectTo: `${process.env.PUBLIC_SITE_URL || 'https://organizacaofinanceira-gamma.vercel.app'}/login`,
                data: {
                    created_via: 'register_api',
                    created_at: new Date().toISOString()
                }
            }
        })

        if (error) {
            console.error('❌ Erro ao criar usuário:', error)
            
            if (error.message.includes('already registered') || error.message.includes('User already registered')) {
                throw createError({ 
                    statusCode: 409, 
                    statusMessage: 'Este email já está cadastrado' 
                })
            }
            
            throw createError({ 
                statusCode: 500, 
                statusMessage: `Erro ao criar usuário: ${error.message}` 
            })
        }

        console.log('✅ Usuário criado com sucesso:', data.user?.email)
        
        // Verificar se precisa confirmar email
        const needsConfirmation = !data.user?.email_confirmed_at

        return { 
            success: true, 
            message: needsConfirmation 
                ? 'Usuário criado! Verifique seu email para confirmar o cadastro.'
                : 'Usuário criado com sucesso!',
            needsEmailConfirmation: needsConfirmation,
            user: {
                id: data.user?.id,
                email: data.user?.email,
                email_confirmed: !!data.user?.email_confirmed_at
            }
        }

    } catch (error: any) {
        console.error('❌ Erro no registro:', error)
        
        if (error.statusCode) {
            throw error
        }
        
        throw createError({ 
            statusCode: 500, 
            statusMessage: 'Erro interno do servidor' 
        })
    }
})
