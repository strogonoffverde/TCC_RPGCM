const express = require('express');
const { z } = require('zod');
const pool = require('../config/db');
const autenticar = require('../middlewares/autenticar');

const router = express.Router({ mergeParams: true });

router.use(autenticar);

const esquemaId = z.coerce.number().int().positive();

const esquemaAdicionar = z.object({
  id_item: z.number().int().positive(),
  quantidade: z.number().int().min(1).max(999).optional(),
});

const esquemaQuantidade = z.object({
  quantidade: z.number().int().min(1).max(999),
});

function camposInvalidos(resultado) {
  return resultado.error.issues.map((problema) => problema.path.join('.'));
}

router.use(async (req, res, next) => {
  const id = esquemaId.safeParse(req.params.id);
  if (!id.success) {
    return res.status(400).json({ erro: 'Identificador inválido' });
  }

  try {
    const [linhas] = await pool.query(
      'SELECT id_personagem FROM personagem WHERE id_personagem = ? AND id_usuario = ?',
      [id.data, req.usuario.id_usuario]
    );
    if (linhas.length === 0) {
      return res.status(404).json({ erro: 'Personagem não encontrado' });
    }
    req.idPersonagem = id.data;
    next();
  } catch (erro) {
    console.error('Erro ao conferir personagem:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [linhas] = await pool.query(
      `SELECT i.id_item, i.nome, i.descricao, i.tipo, i.valor, inv.quantidade
       FROM inventario inv
       JOIN item i ON i.id_item = inv.id_item
       WHERE inv.id_personagem = ?
       ORDER BY i.tipo, i.nome`,
      [req.idPersonagem]
    );
    res.json(linhas.map((linha) => ({ ...linha, valor: Number(linha.valor) })));
  } catch (erro) {
    console.error('Erro ao listar inventário:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

router.post('/', async (req, res) => {
  const dados = esquemaAdicionar.safeParse(req.body);
  if (!dados.success) {
    return res.status(400).json({ erro: 'Dados inválidos', campos: camposInvalidos(dados) });
  }

  const { id_item } = dados.data;
  const quantidade = dados.data.quantidade ?? 1;

  try {
    const [itens] = await pool.query('SELECT id_item FROM item WHERE id_item = ?', [id_item]);
    if (itens.length === 0) {
      return res.status(400).json({ erro: 'Item inválido' });
    }

    await pool.query(
      `INSERT INTO inventario (id_personagem, id_item, quantidade)
       VALUES (?, ?, ?) AS novo
       ON DUPLICATE KEY UPDATE quantidade = LEAST(inventario.quantidade + novo.quantidade, 999)`,
      [req.idPersonagem, id_item, quantidade]
    );

    res.status(201).json({ mensagem: 'Item adicionado ao inventário', id_item });
  } catch (erro) {
    console.error('Erro ao adicionar item:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

router.put('/:idItem', async (req, res) => {
  const idItem = esquemaId.safeParse(req.params.idItem);
  if (!idItem.success) {
    return res.status(400).json({ erro: 'Identificador inválido' });
  }

  const dados = esquemaQuantidade.safeParse(req.body);
  if (!dados.success) {
    return res.status(400).json({ erro: 'Dados inválidos', campos: camposInvalidos(dados) });
  }

  try {
    const [existente] = await pool.query(
      'SELECT id_inventario FROM inventario WHERE id_personagem = ? AND id_item = ?',
      [req.idPersonagem, idItem.data]
    );
    if (existente.length === 0) {
      return res.status(404).json({ erro: 'Item não encontrado no inventário' });
    }

    await pool.query(
      'UPDATE inventario SET quantidade = ? WHERE id_personagem = ? AND id_item = ?',
      [dados.data.quantidade, req.idPersonagem, idItem.data]
    );

    res.json({ mensagem: 'Quantidade atualizada', id_item: idItem.data });
  } catch (erro) {
    console.error('Erro ao atualizar quantidade:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

router.delete('/:idItem', async (req, res) => {
  const idItem = esquemaId.safeParse(req.params.idItem);
  if (!idItem.success) {
    return res.status(400).json({ erro: 'Identificador inválido' });
  }

  try {
    const [resultado] = await pool.query(
      'DELETE FROM inventario WHERE id_personagem = ? AND id_item = ?',
      [req.idPersonagem, idItem.data]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Item não encontrado no inventário' });
    }

    res.json({ mensagem: 'Item removido do inventário', id_item: idItem.data });
  } catch (erro) {
    console.error('Erro ao remover item:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;