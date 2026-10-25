const express = require('express');
const { z } = require('zod');
const pool = require('../config/db');
const autenticar = require('../middlewares/autenticar');

const router = express.Router({ mergeParams: true });

router.use(autenticar);

const esquemaId = z.coerce.number().int().positive();

const esquemaAdicionar = z.object({
  id_habilidade: z.number().int().positive(),
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
      'SELECT id_personagem, nivel FROM personagem WHERE id_personagem = ? AND id_usuario = ?',
      [id.data, req.usuario.id_usuario]
    );
    if (linhas.length === 0) {
      return res.status(404).json({ erro: 'Personagem não encontrado' });
    }
    req.idPersonagem = id.data;
    req.nivelPersonagem = linhas[0].nivel;
    next();
  } catch (erro) {
    console.error('Erro ao conferir personagem:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [linhas] = await pool.query(
      `SELECT h.id_habilidade, h.nome, h.descricao, h.tipo, h.custo_mana, h.nivel_minimo,
              ph.nivel_habilidade
       FROM personagem_habilidade ph
       JOIN habilidade h ON h.id_habilidade = ph.id_habilidade
       WHERE ph.id_personagem = ?
       ORDER BY h.nivel_minimo, h.nome`,
      [req.idPersonagem]
    );
    res.json(
      linhas.map((linha) => ({
        ...linha,
        disponivel: req.nivelPersonagem >= linha.nivel_minimo,
      }))
    );
  } catch (erro) {
    console.error('Erro ao listar habilidades do personagem:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

router.post('/', async (req, res) => {
  const dados = esquemaAdicionar.safeParse(req.body);
  if (!dados.success) {
    return res.status(400).json({ erro: 'Dados inválidos', campos: camposInvalidos(dados) });
  }

  try {
    const [habilidades] = await pool.query(
      'SELECT id_habilidade, nivel_minimo FROM habilidade WHERE id_habilidade = ?',
      [dados.data.id_habilidade]
    );
    if (habilidades.length === 0) {
      return res.status(400).json({ erro: 'Habilidade inválida' });
    }

    const { nivel_minimo } = habilidades[0];
    if (req.nivelPersonagem < nivel_minimo) {
      return res
        .status(400)
        .json({ erro: `Nível mínimo para esta habilidade: ${nivel_minimo}` });
    }

    await pool.query(
      `INSERT INTO personagem_habilidade (id_personagem, id_habilidade, nivel_habilidade)
       VALUES (?, ?, 1)`,
      [req.idPersonagem, dados.data.id_habilidade]
    );

    res.status(201).json({
      mensagem: 'Habilidade adicionada',
      id_habilidade: dados.data.id_habilidade,
    });
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'O personagem já tem esta habilidade' });
    }
    console.error('Erro ao adicionar habilidade:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

router.delete('/:idHabilidade', async (req, res) => {
  const idHabilidade = esquemaId.safeParse(req.params.idHabilidade);
  if (!idHabilidade.success) {
    return res.status(400).json({ erro: 'Identificador inválido' });
  }

  try {
    const [resultado] = await pool.query(
      'DELETE FROM personagem_habilidade WHERE id_personagem = ? AND id_habilidade = ?',
      [req.idPersonagem, idHabilidade.data]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Habilidade não encontrada no personagem' });
    }

    res.json({ mensagem: 'Habilidade removida', id_habilidade: idHabilidade.data });
  } catch (erro) {
    console.error('Erro ao remover habilidade:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

module.exports = router;