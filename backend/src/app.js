const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pool = require('./config/db');
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const catalogoRoutes = require('./routes/catalogo');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/saude', (req, res) => {
  res.json({ status: 'Tudo ok', sistema: 'RPGCM' });
});

app.get('/api/saude/banco', async (req, res) => {
  try {
    const [linhas] = await pool.query(
      'SELECT COUNT(*) AS total FROM information_schema.tables WHERE table_schema = ?',
      [process.env.DB_NAME]
    );
    res.json({ status: 'Banco conectado', tabelas: linhas[0].total });
  } catch (erro) {
    console.error('Erro ao conectar no banco:', erro.message);
    res.status(500).json({ erro: 'Não deu para conectar ao banco' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api', catalogoRoutes); 
app.use((req, res) => {
  res.status(404).json({ erro: 'não encontramos' });
});

module.exports = app;