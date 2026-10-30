const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

const SENHA = 'SenhaTeste123';

function cabecalho(token) {
  return { Authorization: `Bearer ${token}` };
}

async function criarUsuario(prefixo) {
  const sufixo = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const email = `teste.auto.${prefixo}.${sufixo}@exemplo.com`;

  const cadastro = await request(app)
    .post('/api/auth/cadastro')
    .send({ nome: 'Teste Automatico', email, senha: SENHA });
  if (cadastro.statusCode !== 201) {
    throw new Error(`Falha ao cadastrar usuário de teste: ${cadastro.statusCode}`);
  }

  const login = await request(app).post('/api/auth/login').send({ email, senha: SENHA });
  return { email, token: login.body.token };
}

async function limparUsuarios(emails) {
  const lista = emails.filter(Boolean);
  if (lista.length === 0) return;

  await pool.query(
    'DELETE FROM personagem WHERE id_usuario IN (SELECT id_usuario FROM usuario WHERE email IN (?))',
    [lista]
  );
  await pool.query('DELETE FROM usuario WHERE email IN (?)', [lista]);
}

function sucesso(res) {
  expect(res.statusCode).toBeGreaterThanOrEqual(200);
  expect(res.statusCode).toBeLessThan(300);
}

module.exports = { criarUsuario, limparUsuarios, cabecalho, sucesso };