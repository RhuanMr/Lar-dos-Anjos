import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Carregar variáveis de ambiente PRIMEIRO
dotenv.config();

import { testConnection } from '@/database/supabase';
import { errorHandler } from '@/middlewares/errorHandler';
import usuarioRoutes from '@/routes/usuario-routes';
import projetoRoutes from '@/routes/projeto-routes';
import voluntarioRoutes from '@/routes/voluntario-routes';
import funcionarioRoutes from '@/routes/funcionario-routes';
import doadorRoutes from '@/routes/doador-routes';
import adotanteRoutes from '@/routes/adotante-routes';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middlewares de Segurança
app.use(helmet());

// CORS
const corsOrigin = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por windowMs
});
app.use(limiter);

// Parser de JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas de Health Check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Backend PawHub está ativo' });
});

app.get('/api/status', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'running',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    },
  });
});

// Rotas da aplicação
app.use('/api', usuarioRoutes);
app.use('/api', projetoRoutes);
app.use('/api', voluntarioRoutes);
app.use('/api', funcionarioRoutes);
app.use('/api', doadorRoutes);
app.use('/api', adotanteRoutes);

// Middleware de Tratamento de Erros
app.use(errorHandler);

// Inicializar servidor
async function startServer() {
  try {
    // Testar conexão com Supabase
    const connected = await testConnection();

    if (!connected) {
      console.warn(
        '⚠️ Não foi possível conectar ao Supabase. Verifique as variáveis de ambiente.'
      );
    }

    app.listen(PORT, () => {
      console.log(`\n🐾 Servidor PawHub rodando em http://localhost:${PORT}`);
      console.log(`📝 Logs: NODE_ENV=${process.env.NODE_ENV}`);
      console.log(`\n📚 Endpoints disponíveis:`);
      console.log(`   GET    /api/health`);
      console.log(`   GET    /api/status`);
      console.log(`   GET    /api/usuarios`);
      console.log(`   POST   /api/usuarios`);
      console.log(`   GET    /api/usuarios/:id`);
      console.log(`   PATCH  /api/usuarios/:id`);
      console.log(`   DELETE /api/usuarios/:id`);
      console.log(`   PATCH  /api/usuarios/:id/promover-admin`);
      console.log(`   GET    /api/projetos`);
      console.log(`   POST   /api/projetos`);
      console.log(`   GET    /api/projetos/:id`);
      console.log(`   PATCH  /api/projetos/:id`);
      console.log(`   DELETE /api/projetos/:id`);
      console.log(`\n📋 Endpoints de Voluntários:`);
      console.log(`   GET    /api/voluntarios`);
      console.log(`   GET    /api/voluntarios/projeto/:projetoId`);
      console.log(`   GET    /api/voluntarios/usuario/:usuarioId`);
      console.log(`   GET    /api/voluntarios/:usuarioId/:projetoId`);
      console.log(`   POST   /api/voluntarios`);
      console.log(`   PATCH  /api/voluntarios/:usuarioId/:projetoId`);
      console.log(`   DELETE /api/voluntarios/:usuarioId/:projetoId`);
      console.log(`\n👔 Endpoints de Funcionários:`);
      console.log(`   GET    /api/funcionarios`);
      console.log(`   GET    /api/funcionarios/projeto/:projetoId`);
      console.log(`   GET    /api/funcionarios/usuario/:usuarioId`);
      console.log(`   GET    /api/funcionarios/:usuarioId/:projetoId`);
      console.log(`   POST   /api/funcionarios`);
      console.log(`   PATCH  /api/funcionarios/:usuarioId/:projetoId`);
      console.log(`   DELETE /api/funcionarios/:usuarioId/:projetoId`);
      console.log(`   PATCH  /api/funcionarios/:usuarioId/:projetoId/conceder-privilegios`);
      console.log(`   PATCH  /api/funcionarios/:usuarioId/:projetoId/remover-privilegios`);
      console.log(`\n💰 Endpoints de Doadores:`);
      console.log(`   GET    /api/doadores`);
      console.log(`   GET    /api/doadores/projeto/:projetoId`);
      console.log(`   GET    /api/doadores/usuario/:usuarioId`);
      console.log(`   GET    /api/doadores/:usuarioId/:projetoId`);
      console.log(`   POST   /api/doadores`);
      console.log(`   PATCH  /api/doadores/:usuarioId/:projetoId`);
      console.log(`   DELETE /api/doadores/:usuarioId/:projetoId`);
      console.log(`\n🏠 Endpoints de Adotantes:`);
      console.log(`   POST   /api/adotantes`);
      console.log(`   DELETE /api/adotantes/:usuarioId\n`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

export default app;
