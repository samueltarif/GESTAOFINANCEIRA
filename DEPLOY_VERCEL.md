# 🚀 Deploy no Vercel - Gestão Financeira

## 📋 Pré-requisitos

1. ✅ Projeto no GitHub: `https://github.com/samueltarif/GESTAOFINANCEIRA`
2. ✅ Conta no Vercel: `https://vercel.com`
3. ✅ Projeto Supabase configurado

## 🔧 Passos para Deploy

### 1. Conectar Repositório ao Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "New Project"
3. Conecte sua conta do GitHub
4. Selecione o repositório `GESTAOFINANCEIRA`
5. Clique em "Import"

### 2. Configurar Variáveis de Ambiente

No painel do Vercel, vá em **Settings > Environment Variables** e adicione:

```env
SUPABASE_URL=sua_url_do_supabase_aqui
SUPABASE_KEY=sua_chave_publica_do_supabase_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_do_supabase_aqui
SUPABASE_JWT_SECRET=seu_jwt_secret_do_supabase_aqui
```

**⚠️ IMPORTANTE**: Marque todas as variáveis para **Production**, **Preview** e **Development**.

### 3. Configurações de Build

O Vercel detectará automaticamente que é um projeto Nuxt 3. Verifique se as configurações estão:

- **Framework Preset**: `Nuxt.js`
- **Build Command**: `npm run build`
- **Output Directory**: `.output/public`
- **Install Command**: `npm install`

### 4. Deploy

1. Clique em "Deploy"
2. Aguarde o build completar (2-3 minutos)
3. Acesse a URL fornecida pelo Vercel

## 🔗 URLs Importantes

- **Repositório**: https://github.com/samueltarif/GESTAOFINANCEIRA
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard

## ✅ Verificações Pós-Deploy

Após o deploy, teste:

1. ✅ **Página inicial** carrega corretamente
2. ✅ **Registro** de novo usuário funciona
3. ✅ **Login** com usuário existente funciona
4. ✅ **Dashboard** exibe dados corretamente
5. ✅ **Criação** de workspaces, contas, categorias e transações
6. ✅ **Isolamento** de dados entre usuários

## 🐛 Troubleshooting

### Erro de Build
- Verifique se todas as dependências estão no `package.json`
- Confirme se as variáveis de ambiente estão configuradas

### Erro de Conexão com Supabase
- Verifique se as URLs e chaves estão corretas
- Confirme se o projeto Supabase está ativo

### Erro 500 nas APIs
- Verifique os logs no painel do Vercel
- Confirme se as variáveis de ambiente estão disponíveis

## 🔄 Deploy Automático

Após a configuração inicial, qualquer push para a branch `master` fará deploy automático no Vercel.

## 📱 Domínio Personalizado (Opcional)

1. No painel do Vercel, vá em **Settings > Domains**
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções do Vercel

---

🎉 **Parabéns!** Seu sistema de gestão financeira está no ar!