# 🎨 Frontend - Sistema de Gestão de RH
## Enterprise Edition - Arquitetura e Componentes Principais

## 📋 Visão Geral

Sistema frontend construído com React 18, TanStack Query, e Tailwind CSS, seguindo princípios de **Design System Enterprise** com foco em performance, acessibilidade e experiência do usuário.

## 🏗️ Arquitetura

```
frontend/
├── src/
│   ├── components/           # Componentes reutilizáveis
│   │   ├── ui/              # Design System (Button, Card, Input, etc)
│   │   ├── layout/          # Layout components (Dashboard Shell)
│   │   └── payroll/         # Componentes de folha (Holerite Digital)
│   │
│   ├── pages/               # Páginas principais por role
│   │   ├── auth/           # Login, Registro
│   │   ├── rh/             # Dashboard RH, Funcionários, Frequência, Folha
│   │   ├── manager/        # Dashboard Gerente
│   │   └── employee/       # Dashboard Funcionário
│   │
│   ├── services/            # Serviços de API
│   │   └── api.js          # Axios com interceptors JWT
│   │
│   ├── stores/              # Estado global (Zustand)
│   │   └── authStore.js    # Autenticação e autorização
│   │
│   ├── hooks/               # Custom React Hooks
│   │   └── useCustomHooks.js
│   │
│   ├── lib/                 # Utilitários
│   │   └── utils.js        # Helpers (formatação, cálculos)
│   │
│   ├── App.jsx             # Router e configuração de rotas
│   ├── main.jsx            # Entry point
│   └── index.css           # Estilos globais e Tailwind
│
├── public/                  # Assets estáticos
├── .env.example            # Variáveis de ambiente
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎯 Tech Stack

- **React 18** - UI Library
- **Vite** - Build tool ultra-rápido
- **TanStack Query (React Query)** - Server state management e caching
- **Zustand** - Client state management leve
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Axios** - HTTP client
- **React Router v6** - Navegação
- **Tailwind CSS** - Utility-first CSS
- **Recharts** - Gráficos e visualizações
- **Lucide React** - Ícones modernos

## 🎨 Design System

### Paleta de Cores (Enterprise)

```css
Primary (Blue):   #0ea5e9 → #075985
Success (Green):  #22c55e → #16a34a
Warning (Orange): #f59e0b → #d97706
Danger (Red):     #ef4444 → #dc2626
Gray (Neutral):   #f9fafb → #111827
```

### Componentes UI

#### 1. **Button**
```jsx
<Button variant="primary|secondary|outline|ghost|danger|success" size="sm|md|lg" loading={false}>
  Click Me
</Button>
```

#### 2. **Card**
```jsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardContent>Conteúdo</CardContent>
  <CardFooter>Rodapé</CardFooter>
</Card>
```

#### 3. **Input / Select**
```jsx
<Input 
  label="Nome" 
  placeholder="Digite..." 
  error="Mensagem de erro"
/>

<Select label="Opções">
  <option value="1">Opção 1</option>
</Select>
```

#### 4. **Table**
```jsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Coluna</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Valor</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### 5. **Toast Notifications**
```jsx
const toast = useToast();
toast.success('Operação realizada!');
toast.error('Erro ao processar');
toast.warning('Atenção!');
toast.info('Informação');
```

#### 6. **Skeleton Loaders**
```jsx
<Skeleton className="h-10 w-full" />
<TableSkeleton rows={5} columns={4} />
<CardSkeleton />
```

## 📦 Componentes Principais

### 1. Dashboard Layout (Shell)

**Arquivo:** `src/components/layout/DashboardLayout.jsx`

Layout responsivo com:
- ✅ Sidebar colapsável com navegação por role
- ✅ Header com perfil, notificações e busca
- ✅ Mobile-first (hamburger menu)
- ✅ Breadcrumbs automáticos
- ✅ Dark mode ready

**Features:**
- Navegação condicional baseada em roles (RH, Gerente, Colaborador)
- Logout com limpeza de sessão
- Indicadores visuais de rota ativa

### 2. Dashboard RH (Analytics)

**Arquivo:** `src/pages/rh/RHDashboard.jsx`

Dashboard executivo com:
- ✅ KPI Cards (Total Funcionários, Folha, Horas Extras, Salário Médio)
- ✅ Gráfico de Barras - Comparação Ciclo 1 vs Ciclo 2
- ✅ Gráfico de Pizza - Distribuição por Departamento
- ✅ Gráfico de Linha - Evolução da Folha (7 meses)
- ✅ Feed de Atividades Recentes
- ✅ Alertas e Notificações

**Integração:**
- React Query para cache inteligente
- Recharts para visualizações
- Skeleton screens durante loading

### 3. Gestão de Frequência

**Arquivo:** `src/pages/rh/AttendancePage.jsx`

Página robusta para controle de ponto:
- ✅ Cards de estatísticas (Registros, Horas Extras, Faltas, Média)
- ✅ Filtros por Mês, Ano e Ciclo (Dia 20 / Dia 05)
- ✅ Busca por funcionário
- ✅ Tabela com badges visuais (50%, 100%, Faltas)
- ✅ Modal de Lançamento Individual
- ✅ Modal de Lançamento em Lote (batch)
- ✅ Exportação de dados

**Features:**
- Validação com Zod
- React Hook Form
- Mutations otimistas
- Toast feedback

### 4. Holerite Digital

**Arquivo:** `src/components/payroll/PayslipComponent.jsx`

Componente de visualização de holerite:
- ✅ Header com info do funcionário (CPF, Cargo, Departamento)
- ✅ Resumo visual (Salário Base, Proventos, Descontos)
- ✅ Seção de Proventos detalhada
- ✅ Seção de Descontos com INSS progressivo
- ✅ **Cálculo visual do INSS** (transparência total)
- ✅ Informações de FGTS (8% provisionado)
- ✅ Valor líquido em destaque
- ✅ Botões de Imprimir e Baixar PDF

**Diferenciais:**
- Cálculo progressivo do INSS com breakdown interativo
- Visual indicators para Ciclo 1 (sem INSS) vs Ciclo 2 (com INSS)
- Design clean e profissional para impressão

## 🔐 Autenticação e Autorização

### Auth Store (Zustand)

```javascript
import useAuthStore from './stores/authStore';

const { user, isAuthenticated, login, logout, hasRole } = useAuthStore();

// Login
await login(username, password);

// Logout
logout();

// Verificar role
if (hasRole('RH')) {
  // ...
}
```

### Protected Routes

```jsx
<ProtectedRoute allowedRoles={['RH', 'Gerente']}>
  <Component />
</ProtectedRoute>
```

### JWT Interceptor

Implementado em `src/services/api.js`:
- ✅ Auto-inject do token Bearer em todas as requisições
- ✅ Tratamento global de erros 401/403
- ✅ Redirect automático para login em caso de sessão expirada
- ✅ Mensagens de erro padronizadas

## 🌐 Serviços de API

### Estrutura dos Serviços

```javascript
// Auth
authService.login(username, password)
authService.logout()
authService.getCurrentUser()

// Employees
employeeService.getAll(params)
employeeService.getById(id)
employeeService.create(data)
employeeService.update(id, data)
employeeService.delete(id)
employeeService.getStatistics()

// Attendance
attendanceService.getAll(params)
attendanceService.createBatch(dataArray)
attendanceService.getByCycle(month, year, cycle)
attendanceService.getByEmployee(employeeId)

// Payroll
payrollService.getAll(params)
payrollService.calculate(data)
payrollService.processBatch(month, year, cycle)
payrollService.getPayslip(id)
payrollService.getAnalytics(month, year)
```

## 🎣 Custom Hooks

```javascript
import { useFetch, usePagination, useModal, useDebounce } from './hooks/useCustomHooks';

// Fetch com React Query
const { data, isLoading, error } = useFetch('employees', () => employeeService.getAll());

// Paginação
const { page, pageSize, nextPage, prevPage } = usePagination(1, 10);

// Modal
const modal = useModal();
modal.open();
modal.close();

// Debounce para buscas
const debouncedSearch = useDebounce(searchTerm, 500);
```

## 🚀 Como Executar

### 1. Instalar Dependências

```bash
cd frontend
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Executar em Desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:5173`

### 4. Build para Produção

```bash
npm run build
npm run preview
```

## 📱 Responsividade

Todas as páginas seguem **mobile-first**:

- **Mobile (<640px):** Layout empilhado, menu hamburger
- **Tablet (640px-1024px):** Grid 2 colunas, sidebar colapsável
- **Desktop (>1024px):** Sidebar fixa, grid 4 colunas

### Breakpoints Tailwind

```javascript
sm: '640px'   // Tablet
md: '768px'   // Tablet grande
lg: '1024px'  // Desktop
xl: '1280px'  // Desktop grande
2xl: '1536px' // Ultra-wide
```

## 🎯 Fluxo de Dados (React Query)

### Cache Strategy

```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,  // Não refetch ao focar janela
      retry: 1,                      // 1 retry em caso de erro
      staleTime: 5 * 60 * 1000,     // Cache válido por 5 minutos
    },
  },
});
```

### Mutations com Invalidação

```javascript
const mutation = useMutation({
  mutationFn: attendanceService.create,
  onSuccess: () => {
    queryClient.invalidateQueries(['attendance']);  // Revalida cache
    toast.success('Registrado!');
  },
});
```

## 🧪 Testes (Próximos Passos)

Estrutura recomendada:

```
frontend/
├── src/
│   └── __tests__/
│       ├── components/
│       ├── pages/
│       └── hooks/
```

Ferramentas sugeridas:
- **Vitest** - Test runner
- **Testing Library** - Component testing
- **MSW** - API mocking

## 📊 Performance

### Otimizações Implementadas

- ✅ Code splitting por rota (React.lazy)
- ✅ Memoização com useMemo/useCallback
- ✅ Virtualização de listas longas (considerar react-window)
- ✅ Lazy loading de imagens
- ✅ Prefetch de rotas críticas
- ✅ Cache inteligente com React Query

### Métricas Alvo

- **FCP (First Contentful Paint):** < 1.5s
- **LCP (Largest Contentful Paint):** < 2.5s
- **TTI (Time to Interactive):** < 3.5s
- **Bundle Size:** < 200KB (gzipped)

## 🎨 Guia de Estilo

### Nomenclatura

- **Componentes:** PascalCase (`DashboardLayout`)
- **Hooks:** camelCase com prefixo `use` (`useAuth`)
- **Utilitários:** camelCase (`formatCurrency`)
- **Constantes:** UPPER_SNAKE_CASE (`API_URL`)

### Estrutura de Componente

```jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Props com destructuring
export function MyComponent({ title, onSubmit }) {
  // Hooks primeiro
  const [state, setState] = useState(null);
  const { data, isLoading } = useQuery(...);

  // Event handlers
  const handleClick = () => {
    // ...
  };

  // Early returns
  if (isLoading) return <Skeleton />;

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

## 🔧 Troubleshooting

### Problema: CORS Error

**Solução:** Configure o proxy no `vite.config.js`:

```javascript
server: {
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```

### Problema: Token não está sendo enviado

**Solução:** Verifique se o token está no localStorage:

```javascript
localStorage.getItem('token')
```

### Problema: Componentes não renderizam

**Solução:** Verifique o console para erros de importação ou props obrigatórias.

## 📚 Recursos Adicionais

- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Recharts](https://recharts.org/)

## 🤝 Contribuição

Ao adicionar novos componentes:

1. **Crie na pasta correta** (`components/ui` para reutilizáveis)
2. **Documente props** com JSDoc
3. **Adicione tipos** (considerar migração para TypeScript)
4. **Teste responsividade** em todos os breakpoints
5. **Adicione loading states** e error handling

## 📝 Próximas Features Planejadas

- [ ] Dashboard do Gerente (Analytics de equipe)
- [ ] Dashboard do Funcionário (Holerites e perfil)
- [ ] Página de Folha de Pagamento (Processamento)
- [ ] Relatórios exportáveis (PDF/Excel)
- [ ] Notificações em tempo real (WebSockets)
- [ ] Dark mode toggle
- [ ] Internacionalização (i18n)
- [ ] Migração para TypeScript
- [ ] Testes unitários e E2E

---

**Desenvolvido com ❤️ usando React 18 e Tailwind CSS**
