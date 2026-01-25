# Render.com - Backend .NET Core

## Como hospedar o backend (.NET 8 + SQLite) no Render

1. **Crie um repositório no GitHub com o backend**
2. **Acesse https://render.com e crie uma conta**
3. Clique em "New Web Service"
4. Conecte seu GitHub e selecione o repositório
5. Configure:
   - **Name:** hr-backend
   - **Environment:** .NET
   - **Build Command:** dotnet build
   - **Start Command:** dotnet run --project backend/HRManagementAPI.csproj
   - **Root Directory:** (deixe vazio ou "backend" se for monorepo)
   - **Branch:** main
   - **Region:** (padrão)
6. **Variáveis de ambiente:**
   - `ASPNETCORE_ENVIRONMENT=Production`
   - (opcional) `ConnectionStrings__DefaultConnection=Data Source=app.db` (ou use SQLite padrão)
7. Clique em "Create Web Service"
8. O Render irá buildar e publicar sua API. O endpoint será algo como `https://hr-backend.onrender.com`

---

# Vercel - Frontend React/Vite

## Como hospedar o frontend no Vercel

1. **Crie um repositório no GitHub com o frontend**
2. **Acesse https://vercel.com e crie uma conta**
3. Clique em "Add New Project" e conecte seu GitHub
4. Selecione o repositório do frontend
5. Configure:
   - **Framework:** Vite
   - **Build Command:** npm run build
   - **Output Directory:** dist
   - **Environment Variables:**
     - `VITE_API_URL=https://hr-backend.onrender.com` (ajuste para o endpoint do backend Render)
6. Clique em "Deploy"
7. O Vercel irá buildar e publicar seu frontend. O domínio será algo como `https://seu-projeto.vercel.app`

---

# Dicas Gerais
- Faça commit/push das alterações para o GitHub antes de conectar nas plataformas.
- Sempre ajuste o CORS no backend para aceitar o domínio do frontend Vercel.
- Se precisar de build monorepo, Render e Vercel suportam configuração customizada.

---

# Exemplo de .vercelignore
node_modules
backend/
.git

# Exemplo de render.yaml (opcional)
services:
  - type: web
    name: hr-backend
    env: dotnet
    buildCommand: dotnet build
    startCommand: dotnet run --project backend/HRManagementAPI.csproj
    plan: free
    branch: main
    rootDir: backend
    envVars:
      - key: ASPNETCORE_ENVIRONMENT
        value: Production
      - key: ConnectionStrings__DefaultConnection
        value: Data Source=app.db
