import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

// Carrega as variáveis de ambiente
config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rota básica de teste
app.get('/', (req, res) => {
  res.json({ message: 'API do Lar dos Anjos funcionando!' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});