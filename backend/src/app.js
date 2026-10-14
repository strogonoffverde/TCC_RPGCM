const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/saude', (req, res) => {
  res.json({ status: 'Tudo ok', sistema: 'RPGCM' });
});

app.use((req, res) => {
  res.status(404).json({ erro: 'não encontramos' });
});

module.exports = app;