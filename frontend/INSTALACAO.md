# 🚀 Guia de Instalação e Execução

## 📦 Instalação

### Passo 1: Instalar Dependências

Abra o terminal no diretório `frontend/` e execute:

```bash
npm install
```

Este comando instalará todas as dependências listadas no `package.json`:
- React 19.2.0
- TanStack Query (React Query)
- Zustand
- React Hook Form + Zod
- Axios
- Recharts
- Tailwind CSS
- Lucide React
- E outras...

**Tempo estimado:** 2-3 minutos

### Passo 2: Configurar Variáveis de Ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:

```env
VITE_API_URL=http://localhost:5000/api
```

### Passo 3: Verificar Configuração

Teste se tudo está ok:

```bash
npm run dev
```

Se o servidor subir sem erros, a instalação está completa! ✅

---

## 🏃 Comandos Disponíveis

### Desenvolvimento

```bash
npm run dev
```
- Inicia servidor de desenvolvimento
- Hot reload ativado
- Acesse: `http://localhost:5173`

### Build de Produção

```bash
npm run build
```
- Compila o projeto para produção
- Output: `dist/`
- Otimizações: minificação, tree-shaking, code splitting

### Preview da Build

```bash
npm run preview
```
- Serve a build de produção localmente
- Útil para testar antes do deploy

### Linting

```bash
npm run lint
```
- Executa ESLint
- Verifica problemas de código
- Segue as regras configuradas em `eslint.config.js`

---

## 🔧 Troubleshooting

### Problema 1: Erro ao instalar dependências

**Sintoma:**
```
npm ERR! code ERESOLVE
```

**Solução:**
```bash
npm install --legacy-peer-deps
```

### Problema 2: Porta 5173 já está em uso

**Sintoma:**
```
Port 5173 is already in use
```

**Solução:**
Edite `vite.config.js` e mude a porta:
```javascript
server: {
  port: 3000, // Nova porta
}
```

### Problema 3: CORS Error

**Sintoma:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solução:**
Verifique se o proxy está configurado em `vite.config.js`:
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
}
```

### Problema 4: Backend não responde

**Sintoma:**
```
Network Error
```

**Checklist:**
1. ✅ Backend está rodando? (`http://localhost:5000`)
2. ✅ `.env` está configurado corretamente?
3. ✅ Proxy no Vite está ativo?

### Problema 5: Componentes não aparecem

**Sintoma:**
Tela branca ou erro no console

**Solução:**
1. Abra o DevTools (F12)
2. Veja o console para erros
3. Verifique se todas as importações estão corretas
4. Limpe o cache: `Ctrl + Shift + R`

---

## 📁 Estrutura de Arquivos (Referência)

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Design System
│   │   ├── layout/          # Layouts
│   │   └── payroll/         # Componentes específicos
│   ├── pages/
│   │   ├── auth/            # Login
│   │   ├── rh/              # Páginas RH
│   │   ├── manager/         # Páginas Gerente
│   │   └── employee/        # Páginas Funcionário
│   ├── services/
│   │   └── api.js           # Configuração Axios
│   ├── stores/
│   │   └── authStore.js     # Estado global
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilitários
│   ├── App.jsx              # Rotas
│   ├── main.jsx             # Entry point
│   └── index.css            # Estilos globais
├── public/                   # Assets estáticos
├── .env                      # Variáveis (não commitar)
├── .env.example              # Template de .env
├── package.json
├── vite.config.js
├── tailwind.config.js
└── index.html
```

---

## 🧪 Testando a Aplicação

### 1. Login

1. Acesse `http://localhost:5173`
2. Use as credenciais de teste:
   - **RH:** `rh_test` / `123`
   - **Gerente:** `gerente_test` / `123`
   - **Colaborador:** `colaborador_test` / `123`

### 2. Navegação

Após o login, explore:
- **Dashboard:** Visão geral com KPIs
- **Funcionários:** Gestão de cadastros
- **Frequência:** Lançamento de ponto
- **Folha:** Processamento e holerites

### 3. Features para Testar

#### Dashboard RH
- ✅ Ver KPIs atualizados
- ✅ Interagir com gráficos
- ✅ Verificar atividades recentes

#### Frequência
- ✅ Criar registro individual
- ✅ Lançamento em lote
- ✅ Filtrar por ciclo
- ✅ Buscar funcionário

#### Holerite Digital
- ✅ Ver cálculo detalhado
- ✅ Expandir breakdown do INSS
- ✅ Testar impressão
- ✅ Verificar responsividade

---

## 🔐 Autenticação

### Como funciona

1. **Login:**
   - Envia `username` e `password` para `/api/auth/login`
   - Recebe `{ token, user }`
   - Salva no `localStorage`

2. **Requisições Autenticadas:**
   - Interceptor do Axios injeta `Authorization: Bearer <token>`
   - Automático em todas as chamadas

3. **Logout:**
   - Limpa `localStorage`
   - Redireciona para `/login`

4. **Sessão Expirada (401):**
   - Interceptor detecta
   - Limpa dados
   - Redireciona para login

---

## 🎨 Personalizando

### Mudar Cores

Edite `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#0ea5e9',  // Sua cor aqui
  },
}
```

### Mudar Logo

1. Coloque sua logo em `public/logo.png`
2. Edite `DashboardLayout.jsx`:

```jsx
<img src="/logo.png" alt="Logo" />
```

### Mudar Fonte

Edite `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=SuaFonte:wght@400;600;700&display=swap');

body {
  font-family: 'SuaFonte', sans-serif;
}
```

---

## 📊 Monitoramento

### React Query Devtools

Já está instalado! Durante o desenvolvimento, você verá um botão flutuante no canto inferior direito.

**Features:**
- Ver queries ativas
- Inspecionar cache
- Forçar refetch
- Debug mutations

### Browser DevTools

Use as ferramentas do navegador:
- **Console:** Erros e logs
- **Network:** Requisições HTTP
- **Application:** LocalStorage (token)
- **React DevTools:** Componentes e props

---

## 🚀 Deploy

### Build para Produção

```bash
npm run build
```

Output em `dist/`

### Deploy em Plataformas

#### Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

#### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### Railway

1. Conecte o repositório
2. Configure variáveis de ambiente
3. Deploy automático

### Variáveis de Produção

Configure no painel da plataforma:

```env
VITE_API_URL=https://seu-backend.com/api
```

---

## 📝 Checklist Pré-Deploy

- [ ] `npm run build` sem erros
- [ ] Testes manuais completos
- [ ] `.env.production` configurado
- [ ] API de produção funcionando
- [ ] CORS configurado no backend
- [ ] HTTPS ativado
- [ ] Favicon personalizado
- [ ] Meta tags SEO
- [ ] Analytics configurado

---

## 🆘 Precisa de Ajuda?

1. **Documentação Completa:** Veja `ARQUITETURA.md`
2. **Estrutura do Projeto:** Veja `ESTRUTURA.md`
3. **Código Inline:** Leia os comentários nos arquivos

---

## ⚡ Atalhos do VS Code

### Snippets Úteis

**rfce** → React Function Component Export
```jsx
import React from 'react'

function ComponentName() {
  return (
    <div>ComponentName</div>
  )
}

export default ComponentName
```

**useState** → State Hook
```javascript
const [state, setState] = useState(initialValue)
```

**useEffect** → Effect Hook
```javascript
useEffect(() => {
  // effect
  return () => {
    // cleanup
  }
}, [dependencies])
```

---

## 🎯 Próximos Passos

Após a instalação, explore:

1. ✅ **Login** e navegação
2. ✅ **Dashboard RH** com gráficos
3. ✅ **Gestão de Frequência** com filtros
4. ✅ **Holerite Digital** interativo

Depois, personalize:
- Cores e branding
- Textos e labels
- Features específicas

---

**Happy Coding!** 🚀✨
