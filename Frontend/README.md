# Lar dos Anjos - Frontend

Frontend da plataforma de gerenciamento para ONG de proteção animal Lar dos Anjos.

## 🚀 Tecnologias

- **React 18** - Biblioteca de interface
- **TypeScript** - Linguagem de programação
- **Vite** - Bundler e servidor de desenvolvimento
- **Material UI** - Biblioteca de componentes
- **React Router DOM** - Roteamento
- **React Hook Form** - Gerenciamento de formulários
- **Axios** - Cliente HTTP
- **React Query** - Gerenciamento de estado servidor

## 📦 Instalação

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente:
```bash
cp env.example .env
```

3. Preencher as variáveis no arquivo `.env`:
```env
VITE_API_URL=http://localhost:3001/api
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

## 🛠️ Scripts

- `npm run dev` - Executar em modo desenvolvimento
- `npm run build` - Compilar para produção
- `npm run preview` - Visualizar build de produção
- `npm run lint` - Verificar código com ESLint
- `npm run format` - Formatar código com Prettier
- `npm run type-check` - Verificar tipos TypeScript

## 📁 Estrutura do Projeto

```
src/
├── components/      # Componentes reutilizáveis
│   └── layout/     # Componentes de layout
├── pages/          # Páginas da aplicação
├── context/        # Context providers (Auth, etc.)
├── services/       # Serviços (API calls)
├── styles/         # Temas e estilos
├── types/          # Definições de tipos TypeScript
├── utils/          # Utilitários e helpers
├── App.tsx         # Componente principal
└── main.tsx        # Ponto de entrada
```

## 🎨 Tema

O projeto utiliza Material UI com tema personalizado:
- **Cores primárias:** Verde (#2E7D32) e Laranja (#FF6F00)
- **Tipografia:** Roboto
- **Componentes:** Customizados para a identidade da ONG

## 🔐 Autenticação

O sistema utiliza Context API para gerenciar autenticação:
- Login/logout
- Proteção de rotas
- Persistência de sessão
- Redirecionamento automático

## 📱 Responsividade

- Design mobile-first
- Breakpoints do Material UI
- Sidebar responsiva
- Componentes adaptáveis

## 🧪 Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Verificar tipos
npm run type-check

# Formatar código
npm run format
```

## 🚀 Deploy

```bash
# Compilar para produção
npm run build

# Os arquivos estarão na pasta dist/
```

## 📝 Padrões de Código

- ESLint para análise de código
- Prettier para formatação
- TypeScript strict mode
- Convenções de nomenclatura consistentes
- Componentes funcionais com hooks
