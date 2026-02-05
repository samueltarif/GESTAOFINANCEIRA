# 💰 Gestão Financeira

Sistema completo de controle financeiro pessoal desenvolvido com Nuxt 3, Supabase e TailwindCSS.

## 🚀 Funcionalidades

- ✅ **Autenticação Segura** - Login/registro com Supabase Auth
- ✅ **Workspaces** - Organize suas finanças por contextos (pessoal, negócios, investimentos)
- ✅ **Contas Globais** - Contas bancárias compartilhadas entre workspaces
- ✅ **Categorias** - Organize receitas e despesas por categorias personalizadas
- ✅ **Transações** - Registre e acompanhe todas suas movimentações financeiras
- ✅ **Dashboard Interativo** - Visualize seus dados com gráficos e KPIs
- ✅ **Isolamento Total** - Cada usuário vê apenas seus próprios dados
- ✅ **Responsivo** - Interface adaptada para desktop e mobile

## 🛠️ Tecnologias

- **Frontend**: Nuxt 3, Vue 3, TailwindCSS
- **Backend**: Nuxt Server API, Supabase
- **Banco de Dados**: PostgreSQL (Supabase)
- **Autenticação**: Supabase Auth
- **Deploy**: Vercel
- **Gráficos**: Chart.js

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/samueltarif/GESTAOFINANCEIRA.git
cd GESTAOFINANCEIRA
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:
```env
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_chave_publica_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_do_supabase
```

4. Execute o projeto:
```bash
npm run dev
```

## 🗄️ Estrutura do Banco

O sistema utiliza 5 tabelas principais:

- **users** - Usuários do sistema
- **workspaces** - Espaços de trabalho (pessoal, negócios, etc.)
- **accounts** - Contas bancárias (globais por usuário)
- **categories** - Categorias de receitas/despesas (por workspace)
- **transactions** - Transações financeiras

## 🔒 Segurança

- ✅ Autenticação obrigatória para todas as funcionalidades
- ✅ Isolamento total de dados entre usuários
- ✅ Validação de permissões em todas as APIs
- ✅ Sanitização de dados de entrada
- ✅ Proteção contra SQL Injection

## 🚀 Deploy

O projeto está configurado para deploy automático no Vercel:

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente no painel do Vercel
3. O deploy será feito automaticamente a cada push

## 📱 Como Usar

1. **Registro**: Crie sua conta com email e senha
2. **Login**: Acesse o sistema com suas credenciais
3. **Workspaces**: Crie workspaces para organizar suas finanças
4. **Contas**: Adicione suas contas bancárias (carteira, banco, cartão)
5. **Categorias**: Crie categorias para classificar suas transações
6. **Transações**: Registre receitas e despesas
7. **Dashboard**: Acompanhe seus dados através de gráficos e relatórios

## 🎯 Roadmap

- [ ] Importação de extratos bancários (OFX/CSV)
- [ ] Metas financeiras
- [ ] Relatórios avançados
- [ ] Notificações por email
- [ ] App mobile (React Native)
- [ ] Integração com bancos (Open Banking)

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature
3. Fazer commit das mudanças
4. Fazer push para a branch
5. Abrir um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Samuel Tarif**
- GitHub: [@samueltarif](https://github.com/samueltarif)
- Email: samuel.tarif@gmail.com

---

⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!