# Deploy gratuito (Render + Vercel)

## Backend (.NET) no Render
1. Suba o backend para um repositório GitHub
2. Crie um serviço Web no https://render.com
3. Configure:
	- Build: `dotnet build`
	- Start: `dotnet run --project backend/HRManagementAPI.csproj`
	- RootDir: `backend`
	- Variáveis: `ASPNETCORE_ENVIRONMENT=Production`, `ConnectionStrings__DefaultConnection=Data Source=app.db`
4. O endpoint será algo como `https://hr-backend.onrender.com`

## Frontend (Vite/React) no Vercel
1. Suba o frontend para um repositório GitHub
2. Crie um projeto no https://vercel.com
3. Configure:
	- Framework: Vite
	- Build: `npm run build`
	- Output: `dist`
	- Variável: `VITE_API_URL=https://hr-backend.onrender.com`
4. O domínio será algo como `https://seu-projeto.vercel.app`

## Dicas
- Ajuste o CORS do backend para aceitar o domínio do frontend
- Faça push das alterações antes de conectar nas plataformas
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
