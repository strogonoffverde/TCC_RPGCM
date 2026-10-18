require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET não está definido no arquivo .env');
  process.exit(1);
}

const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor RPGCM rodando em http://localhost:${PORT}`);
});