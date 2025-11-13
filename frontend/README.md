# 🐾 PawHub Frontend

Frontend do **PawHub**, um gerenciador de informações para ONGs que ajudam animais de rua.

## 🚀 Tecnologias

- **React 19** com **TypeScript**
- **Vite** - Build tool rápida
- **Material UI (MUI)** - Biblioteca de componentes
- **Axios** - Cliente HTTP
- **React Router DOM** - Roteamento
- **ESLint + Prettier** - Padronização de código

## 📁 Estrutura do Projeto

```
src/
 ├── api/               → Configuração do Axios e chamadas HTTP
 ├── assets/            → Imagens e ícones
 ├── components/        → Componentes reutilizáveis
 ├── contexts/          → Contextos globais (auth, tema, etc.)
 ├── hooks/             → Hooks personalizados
 ├── layouts/           → Layouts principais (Dashboard, Login, etc.)
 ├── pages/             → Páginas da aplicação
 ├── routes/            → Configuração das rotas
 ├── services/          → Integração com o backend (via Axios)
 ├── theme/             → Definições de tema e paleta do Material UI
 └── types/             → Tipagens globais
```

## 🎨 Tema

O tema customizado do Material UI está configurado com:
- **Primary**: `#88E788` (verde)
- **Secondary**: `#B3EBF2` (azul claro)
- **Background**: `#FFFFFF` (branco)

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run lint` - Executa o ESLint
- `npm run preview` - Preview do build de produção

## 📝 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto `frontend/` com:

```env
# URL da API Backend (incluirá /api automaticamente se não estiver presente)
VITE_API_URL=http://localhost:3000
# ou
VITE_API_URL=http://localhost:3000/api
```

**📄 Documentação completa:** Consulte `ENV_EXAMPLE.md` para mais detalhes sobre as variáveis de ambiente.

## 🚦 Próximos Passos

Consulte o arquivo `contexts/frontend/planejamento_frontend_pawhub.md` para ver as próximas etapas de desenvolvimento.
