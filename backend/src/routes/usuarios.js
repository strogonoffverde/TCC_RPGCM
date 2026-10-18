const express = require('express');
const pool = require('../config/db');
const autenticar = require('../middlewares/autenticar');

const router = express.Router();

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

module.exports = router;