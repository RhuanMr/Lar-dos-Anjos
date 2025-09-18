# Lar dos Anjos - Backend

Backend da plataforma de gerenciamento para ONG de proteção animal Lar dos Anjos.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **TypeScript** - Linguagem de programação
- **Express.js** - Framework web
- **Supabase** - Banco de dados e autenticação
- **Joi** - Validação de dados
- **Jest** - Testes unitários

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
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
JWT_SECRET=seu_jwt_secret
```

## 🛠️ Scripts

- `npm run dev` - Executar em modo desenvolvimento
- `npm run build` - Compilar TypeScript
- `npm start` - Executar versão compilada
- `npm test` - Executar testes
- `npm run lint` - Verificar código com ESLint
- `npm run format` - Formatar código com Prettier

## 📁 Estrutura do Projeto

```
src/
├── config/          # Configurações (Supabase, banco)
├── controllers/     # Controladores (lógica de negócio)
├── middleware/      # Middlewares (auth, validação, erro)
├── routes/          # Definição de rotas
├── services/        # Serviços (integração com APIs)
├── types/           # Definições de tipos TypeScript
├── utils/           # Utilitários e helpers
└── index.ts         # Arquivo principal
```

## 🔐 Autenticação

O sistema utiliza Supabase Auth para autenticação. Todas as rotas protegidas requerem um token JWT válido no header `Authorization: Bearer <token>`.

## 📊 API Endpoints

### Usuários
- `GET /api/users` - Listar usuários (admin)
- `GET /api/users/:id` - Buscar usuário por ID
- `POST /api/users` - Criar usuário (admin)
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário (admin)

### Health Check
- `GET /api/health` - Status da API

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch
```

## 📝 Padrões de Código

- ESLint para análise de código
- Prettier para formatação
- TypeScript strict mode
- Convenções de nomenclatura consistentes

## 🚀 Deploy

1. Compilar o projeto:
```bash
npm run build
```

2. Configurar variáveis de ambiente no servidor

3. Executar:
```bash
npm start
```
