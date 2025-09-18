console.log('🔄 Carregando variáveis de ambiente...');
import dotenv from 'dotenv';
dotenv.config();
console.log('✅ Variáveis de ambiente carregadas');

console.log('🔄 Carregando módulos...');
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { testConnection } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes';
console.log('✅ Módulos carregados');

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middlewares de segurança
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limite de 100 requests por IP
  message: {
    success: false,
    error: 'Muitas requisições deste IP, tente novamente em 15 minutos.'
  }
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Parser de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rotas
app.use('/api', routes);

// Middleware de erro 404
app.use(notFoundHandler);

// Middleware de tratamento de erros
app.use(errorHandler);

// Inicializar servidor
const startServer = async (): Promise<void> => {
  try {
    console.log('🔄 Iniciando servidor...');
    
    // Testar conexão com o banco
    console.log('🔄 Testando conexão com Supabase...');
    const connectionResult = await testConnection();
    console.log('🔄 Resultado da conexão:', connectionResult);
    
    console.log('🔄 Iniciando servidor Express...');
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`🔗 URL: http://0.0.0.0:${PORT}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
    });

    server.on('error', (error) => {
      console.error('❌ Erro no servidor:', error);
    });

    server.on('listening', () => {
      console.log('✅ Servidor está ouvindo na porta', PORT);
    });
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
