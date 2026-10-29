const express = require('express');
const { z } = require('zod');
const pool = require('../config/db');
const autenticar = require('../middlewares/autenticar');

const router = express.Router({ mergeParams: true });
router.use(autenticar);

const LIMITE_EQUIPADOS = 6;

const esquemaEquipar = z.object({
  id_equipamento: z.coerce.number().int().positive(),
});

function camposInvalidos(resultado) {
  return resultado.error.issues.map((problema) => problema.path[0]);
}

async function verificarPersonagem(req, res, next) {
  const idPersonagem = Number(req.params.id);
  if (!Number.isInteger(idPersonagem) || idPersonagem <= 0) {
    return res.status(400).json({ erro: 'Dados inválidos', campos: ['id'] });
  }

  try {
    const [linhas] = await pool.query(
      'SELECT id_personagem FROM personagem WHERE id_personagem = ? AND id_usuario = ?',
      [idPersonagem, req.usuario.id_usuario]
    );
    if (linhas.length === 0) {
      return res.status(404).json({ erro: 'Personagem não encontrado' });
    }
    req.idPersonagem = idPersonagem;
    next();
  } catch (erro) {
    console.error('Erro ao verificar personagem:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}

router.use(verificarPersonagem);

router.get('/', async (req, res) => {
  try {
    const [equipados] = await pool.query(
      `SELECT e.id_equipamento, i.nome, i.tipo, i.descricao,
              e.bonus_ataque, e.bonus_defesa, e.bonus_atributo, e.bonus_atributo_valor
       FROM personagem_equipamento pe
       JOIN equipamento e ON e.id_equipamento = pe.id_equipamento
       JOIN item i ON i.id_item = e.id_item
       WHERE pe.id_personagem = ? AND pe.equipado = 1
       ORDER BY i.tipo, i.nome`,
      [req.idPersonagem]
    );

    const [disponiveis] = await pool.query(
      `SELECT e.id_equipamento, i.nome, i.tipo, i.descricao,
              e.bonus_ataque, e.bonus_defesa, e.bonus_atributo, e.bonus_atributo_valor
       FROM inventario inv
       JOIN equipamento e ON e.id_item = inv.id_item
       JOIN item i ON i.id_item = e.id_item
       LEFT JOIN personagem_equipamento pe
         ON pe.id_equipamento = e.id_equipamento AND pe.id_personagem = inv.id_personagem
       WHERE inv.id_personagem = ? AND (pe.equipado IS NULL OR pe.equipado = 0)
       ORDER BY i.tipo, i.nome`,
      [req.idPersonagem]
    );

    res.json({ equipados, disponiveis });
  } catch (erro) {
    console.error('Erro ao listar equipamentos:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

router.post('/', async (req, res) => {
  const dados = esquemaEquipar.safeParse(req.body);
  if (!dados.success) {
    return res.status(400).json({ erro: 'Dados inválidos', campos: camposInvalidos(dados) });
  }

  const { id_equipamento: idEquipamento } = dados.data;

  try {
    const [noInventario] = await pool.query(
      `SELECT e.id_equipamento
       FROM inventario inv
       JOIN equipamento e ON e.id_item = inv.id_item
       WHERE inv.id_personagem = ? AND e.id_equipamento = ?`,
      [req.idPersonagem, idEquipamento]
    );
    if (noInventario.length === 0) {
      return res.status(400).json({ erro: 'Adicione o item ao inventário antes de equipar' });
    }

    const [jaEquipado] = await pool.query(
      'SELECT equipado FROM personagem_equipamento WHERE id_personagem = ? AND id_equipamento = ?',
      [req.idPersonagem, idEquipamento]
    );
    if (jaEquipado.length > 0 && jaEquipado[0].equipado === 1) {
      return res.status(409).json({ erro: 'Este equipamento já está equipado' });
    }

    const [contagem] = await pool.query(
      'SELECT COUNT(*) AS total FROM personagem_equipamento WHERE id_personagem = ? AND equipado = 1',
      [req.idPersonagem]
    );
    if (contagem[0].total >= LIMITE_EQUIPADOS) {
      return res.status(400).json({ erro: `Limite de ${LIMITE_EQUIPADOS} equipamentos equipados` });
    }

    await pool.query(
      `INSERT INTO personagem_equipamento (id_personagem, id_equipamento, equipado)
       VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE equipado = 1`,
      [req.idPersonagem, idEquipamento]
    );

    res.status(201).json({ id_equipamento: idEquipamento, equipado: true });
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Este equipamento já está equipado' });
    }
    console.error('Erro ao equipar:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

router.delete('/:idEquipamento', async (req, res) => {
  const idEquipamento = Number(req.params.idEquipamento);
  if (!Number.isInteger(idEquipamento) || idEquipamento <= 0) {
    return res.status(400).json({ erro: 'Dados inválidos', campos: ['idEquipamento'] });
  }

  try {
    const [resultado] = await pool.query(
      `UPDATE personagem_equipamento SET equipado = 0
       WHERE id_personagem = ? AND id_equipamento = ? AND equipado = 1`,
      [req.idPersonagem, idEquipamento]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Este equipamento não está equipado' });
    }

    res.json({ id_equipamento: idEquipamento, equipado: false });
  } catch (erro) {
    console.error('Erro ao desequipar:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;