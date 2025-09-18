# 🐾 Lar dos Anjos

Plataforma de gerenciamento para ONG de proteção animal Lar dos Anjos.

## 📋 Sobre o Projeto

O Lar dos Anjos é uma plataforma web desenvolvida para auxiliar ONGs de proteção animal no gerenciamento de seus recursos, animais, voluntários e processos de adoção. A plataforma oferece uma solução completa para organizações que trabalham com resgate e cuidado de animais de rua.

## 🚀 Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **TypeScript** - Linguagem de programação
- **Express.js** - Framework web
- **Supabase** - Banco de dados e autenticação
- **Joi** - Validação de dados

### Frontend
- **React 18** - Biblioteca de interface
- **TypeScript** - Linguagem de programação
- **Vite** - Bundler e servidor de desenvolvimento
- **Material UI** - Biblioteca de componentes
- **React Router DOM** - Roteamento

## 📁 Estrutura do Projeto

```
lar-dos-anjos/
├── backend/                 # API Node.js/Express
│   ├── src/
│   │   ├── config/         # Configurações (Supabase, banco)
│   │   ├── controllers/    # Controladores (lógica de negócio)
│   │   ├── middleware/     # Middlewares (auth, validação)
│   │   ├── routes/         # Definição de rotas
│   │   ├── services/       # Serviços (integração com APIs)
│   │   ├── types/          # Definições de tipos TypeScript
│   │   └── utils/          # Utilitários e helpers
│   └── package.json
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── context/        # Context providers
│   │   ├── services/       # Serviços (API calls)
│   │   ├── styles/         # Temas e estilos
│   │   └── types/          # Definições de tipos TypeScript
│   └── package.json
├── contexts/               # Documentação do projeto
│   ├── REQUISITOS_POR_ETAPAS.md
│   ├── FUNCIONAMENTO_BANCO_DADOS.md
│   ├── CONTEXTO_BACKEND.md
│   └── CONTEXTO_FRONTEND.md
└── package.json           # Scripts do projeto principal
```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd lar-dos-anjos
```

### 2. Instalar dependências
```bash
npm run install:all
```

### 3. Configurar variáveis de ambiente

#### Backend
```bash
cd backend
cp env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:
```env
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
JWT_SECRET=seu_jwt_secret
```

#### Frontend
```bash
cd frontend
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
VITE_API_URL=http://localhost:3001/api
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 4. Configurar banco de dados
Execute o script SQL fornecido no arquivo `contexts/FUNCIONAMENTO_BANCO_DADOS.md` no Supabase SQL Editor.

## 🚀 Executando o Projeto

### Desenvolvimento
```bash
# Executar backend e frontend simultaneamente
npm run dev

# Ou executar separadamente:
npm run dev:backend    # Backend na porta 3001
npm run dev:frontend   # Frontend na porta 3000
```

### Produção
```bash
# Compilar ambos os projetos
npm run build

# Executar em produção
npm start
```

## 📊 Scripts Disponíveis

- `npm run dev` - Executar em modo desenvolvimento
- `npm run build` - Compilar para produção
- `npm run start` - Executar versão compilada
- `npm run install:all` - Instalar todas as dependências
- `npm run lint` - Verificar código com ESLint
- `npm run format` - Formatar código com Prettier
- `npm run test` - Executar testes

## 🔐 Funcionalidades

### ✅ Implementadas (Etapa 1)
- [x] Configuração inicial do projeto
- [x] Estrutura de backend com Express e TypeScript
- [x] Estrutura de frontend com React e Material UI
- [x] Integração com Supabase
- [x] Sistema de autenticação básico
- [x] Configuração de ESLint e Prettier
- [x] Documentação completa

### 🚧 Em Desenvolvimento
- [ ] Cadastro de usuários e organizações
- [ ] Gestão de animais
- [ ] Sistema de adoções
- [ ] Relatórios e dashboard
- [ ] Upload de imagens
- [ ] Notificações

## 📚 Documentação

Consulte a pasta `contexts/` para documentação detalhada:
- **REQUISITOS_POR_ETAPAS.md** - Plano de desenvolvimento em 7 etapas
- **FUNCIONAMENTO_BANCO_DADOS.md** - Estrutura e comandos SQL
- **CONTEXTO_BACKEND.md** - Guia de desenvolvimento do backend
- **CONTEXTO_FRONTEND.md** - Guia de desenvolvimento do frontend

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

Link do Projeto: [https://github.com/lar-dos-anjos/lar-dos-anjos](https://github.com/lar-dos-anjos/lar-dos-anjos)
