# 🧪 COMO TESTAR O SISTEMA

## ⚠️ IMPORTANTE: NÃO ABRA ARQUIVOS HTML DIRETAMENTE!

Os arquivos HTML de teste **NÃO FUNCIONAM** quando abertos diretamente do sistema de arquivos (`file:///`). Eles precisam ser acessados através do servidor Nuxt.

## ✅ FORMA CORRETA DE TESTAR

### 1. Certifique-se que o servidor está rodando
```bash
npm run dev
```

### 2. Acesse as páginas através do navegador

#### Teste da API (RECOMENDADO)
```
http://localhost:3000/test-api
```
Esta página permite testar a API de registro diretamente com logs em tempo real.

#### Página de Registro Debug
```
http://localhost:3000/register-debug
```
Versão simplificada da página de registro com logs extensivos.

#### Página de Registro Original
```
http://localhost:3000/register
```
Página de registro original com correções de hidratação.

### 3. Teste via cURL (Terminal)

#### Windows PowerShell:
```powershell
$body = @{
    email = "teste@exemplo.com"
    password = "123456"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body `
    -UseBasicParsing
```

#### Linux/Mac:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","password":"123456"}'
```

## 📋 CHECKLIST DE TESTES

### Teste 1: API Funcionando
- [ ] Acesse `http://localhost:3000/test-api`
- [ ] Clique em "Testar API de Registro"
- [ ] Verifique se aparece "✅ Sucesso" nos logs
- [ ] Confirme que o usuário foi criado

### Teste 2: Página de Registro Debug
- [ ] Acesse `http://localhost:3000/register-debug`
- [ ] Veja se o painel de debug aparece no canto superior direito
- [ ] Clique em "Testar JS" - deve aparecer um alert
- [ ] Preencha email e senha
- [ ] Clique em "Cadastrar"
- [ ] Verifique os logs no painel de debug

### Teste 3: Página de Registro Original
- [ ] Acesse `http://localhost:3000/register`
- [ ] Abra o console do navegador (F12)
- [ ] Veja se aparecem os logs dos componentes
- [ ] Preencha email e senha
- [ ] Clique em "Cadastrar"
- [ ] Verifique se o cadastro funciona

## 🚀 TESTANDO NO VERCEL

Depois de fazer o deploy no Vercel, teste da mesma forma:

1. **Teste da API**:
   ```
   https://seu-app.vercel.app/test-api
   ```

2. **Página de Registro Debug**:
   ```
   https://seu-app.vercel.app/register-debug
   ```

3. **Página de Registro Original**:
   ```
   https://seu-app.vercel.app/register
   ```

## 🔍 O QUE OBSERVAR

### Logs Esperados no Console:
```
🚀 AUTHFORM.VUE: Componente carregado
🚀 AUTHBUTTON.VUE: Componente carregado
🚀 BUTTON.VUE: Componente carregado
🚀 REGISTER.VUE: Componente montado no DOM
[Ao clicar em Cadastrar]
🔧 FUNÇÃO handleRegister CHAMADA
📧 Email: seu@email.com
✅ Validação passou
🌐 Chamando API...
✅ Sucesso!
```

### Se algo não funcionar:
1. Verifique o console do navegador (F12)
2. Veja a aba Network para verificar as requisições
3. Confira se há erros de JavaScript
4. Teste a API diretamente em `/test-api`

## 💡 DICAS

- **Sempre use o servidor Nuxt** para testar
- **Não abra arquivos HTML diretamente** do explorador de arquivos
- **Use o console do navegador** (F12) para ver logs
- **Teste a API primeiro** antes de testar o formulário
- **Limpe o cache** do navegador se algo não funcionar (Ctrl+Shift+R)