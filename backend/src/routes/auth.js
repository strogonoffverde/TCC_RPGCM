const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const pool = require('../config/db');
const autenticar = require('../middlewares/autenticar');

const router = express.Router();

const esquemaCadastro = z.object({
  nome: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(100),
  senha: z.string().min(8).max(72),
});

const esquemaLogin = z.object({
  email: z.string().trim().toLowerCase().email(),
  senha: z.string().min(1),
});

function camposInvalidos(resultado) {
  return resultado.error.issues.map((problema) => problema.path[0]);
}

router.post('/cadastro', async (req, res) => {
  const dados = esquemaCadastro.safeParse(req.body);
  if (!dados.success) {
    return res.status(400).json({ erro: 'Dados inválidos', campos: camposInvalidos(dados) });
  }

  const { nome, email, senha } = dados.data;

  try {
    const [existente] = await pool.query(
      'SELECT id_usuario FROM usuario WHERE email = ?',
      [email]
    );
    if (existente.length > 0) {
      return res.status(409).json({ erro: 'Já tem um usuário com esse e-mail' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const [resultado] = await pool.query(
      'INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senhaHash]
    );

    res.status(201).json({ id_usuario: resultado.insertId, nome, email });
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Já tem um usuário com esse e-mail' });
    }
    console.error('Erro no cadastro:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

router.post('/login', async (req, res) => {
  const dados = esquemaLogin.safeParse(req.body);
  if (!dados.success) {
    return res.status(400).json({ erro: 'Dados inválidos', campos: camposInvalidos(dados) });
  }

  const { email, senha } = dados.data;

  try {
    const [linhas] = await pool.query(
      'SELECT id_usuario, nome, email, senha FROM usuario WHERE email = ?',
      [email]
    );
    const usuario = linhas[0];
    const senhaConfere = usuario ? await bcrypt.compare(senha, usuario.senha) : false;

    if (!senhaConfere) {
      return res.status(401).json({ erro: 'E-mail ou senha errados' });
    }

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
    );

    res.json({
      token,
      usuario: { id_usuario: usuario.id_usuario, nome: usuario.nome, email: usuario.email },
    });
  } catch (erro) {
    console.error('Erro no login:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

router.post('/logout', autenticar, (req, res) => {
  res.json({ mensagem: 'Logout realizado. Descarte o token no front-end.' });
});

module.exports = router;