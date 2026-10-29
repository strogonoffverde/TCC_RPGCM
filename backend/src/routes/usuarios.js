const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const pool = require('../config/db');
const autenticar = require('../middlewares/autenticar');

const router = express.Router();

const esquemaPerfil = z.object({
  nome: z.string().trim().min(2).max(100),
});

const esquemaSenha = z.object({
  senha_atual: z.string().min(1).max(72),
  senha_nova: z.string().min(8).max(72),
});

function camposInvalidos(resultado) {
  return resultado.error.issues.map((problema) => problema.path[0]);
}

router.get('/perfil', autenticar, async (req, res) => {
  try {
    const [linhas] = await pool.query(
      'SELECT id_usuario, nome, email, data_cadastro FROM usuario WHERE id_usuario = ?',
      [req.usuario.id_usuario]
    );
    if (linhas.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    res.json(linhas[0]);
  } catch (erro) {
    console.error('Erro ao buscar perfil:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

router.put('/perfil', autenticar, async (req, res) => {
  const dados = esquemaPerfil.safeParse(req.body);
  if (!dados.success) {
    return res.status(400).json({ erro: 'Dados inválidos', campos: camposInvalidos(dados) });
  }

  try {
    await pool.query('UPDATE usuario SET nome = ? WHERE id_usuario = ?', [
      dados.data.nome,
      req.usuario.id_usuario,
    ]);
    res.json({ mensagem: 'Perfil atualizado', nome: dados.data.nome });
  } catch (erro) {
    console.error('Erro ao atualizar perfil:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

router.put('/senha', autenticar, async (req, res) => {
  const dados = esquemaSenha.safeParse(req.body);
  if (!dados.success) {
    return res.status(400).json({ erro: 'Dados inválidos', campos: camposInvalidos(dados) });
  }

  const { senha_atual: senhaAtual, senha_nova: senhaNova } = dados.data;

  try {
    const [linhas] = await pool.query('SELECT senha FROM usuario WHERE id_usuario = ?', [
      req.usuario.id_usuario,
    ]);
    if (linhas.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const confere = await bcrypt.compare(senhaAtual, linhas[0].senha);
    if (!confere) {
      return res.status(400).json({ erro: 'Senha atual incorreta' });
    }
    if (senhaAtual === senhaNova) {
      return res.status(400).json({ erro: 'A nova senha precisa ser diferente da atual' });
    }

    const senhaHash = await bcrypt.hash(senhaNova, 10);
    await pool.query('UPDATE usuario SET senha = ? WHERE id_usuario = ?', [
      senhaHash,
      req.usuario.id_usuario,
    ]);

    res.json({ mensagem: 'Senha alterada' });
  } catch (erro) {
    console.error('Erro ao alterar senha:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;