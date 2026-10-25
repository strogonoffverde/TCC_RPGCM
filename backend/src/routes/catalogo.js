const express = require('express');
const pool = require('../config/db');
const autenticar = require('../middlewares/autenticar');

const router = express.Router();

router.get('/racas', autenticar, async (req, res) => {
  try {
    const [linhas] = await pool.query(
      `SELECT id_raca, nome, descricao, bonus_forca, bonus_destreza,
              bonus_constituicao, bonus_inteligencia, bonus_sabedoria, bonus_carisma
       FROM raca
       ORDER BY nome`
    );
    res.json(linhas);
  } catch (erro) {
    console.error('Erro ao listar raças:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

router.get('/classes', autenticar, async (req, res) => {
  try {
    const [linhas] = await pool.query(
      `SELECT id_classe, nome, descricao, vida_base, mana_base
       FROM classe
       ORDER BY nome`
    );
    res.json(linhas);
  } catch (erro) {
    console.error('Erro ao listar classes:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

router.get('/itens', autenticar, async (req, res) => {
  try {
    const [linhas] = await pool.query(
      `SELECT id_item, nome, descricao, tipo, valor
       FROM item
       ORDER BY tipo, nome`
    );
    res.json(linhas.map((linha) => ({ ...linha, valor: Number(linha.valor) })));
  } catch (erro) {
    console.error('Erro ao listar itens:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;