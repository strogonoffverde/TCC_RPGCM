const express = require('express');
const { z } = require('zod');
const pool = require('../config/db');
const autenticar = require('../middlewares/autenticar');

const router = express.Router();

router.use(autenticar);

const valorAtributo = z.number().int().min(1).max(20).optional();

const esquemaCriar = z.object({
  nome: z.string().trim().min(2).max(100),
  id_raca: z.number().int().positive(),
  id_classe: z.number().int().positive(),
  nivel: z.number().int().min(1).max(20).optional(),
  xp: z.number().int().min(0).max(1000000).optional(),
  descricao: z.string().trim().max(2000).nullable().optional(),
  atributos: z
    .object({
      forca: valorAtributo,
      destreza: valorAtributo,
      constituicao: valorAtributo,
      inteligencia: valorAtributo,
      sabedoria: valorAtributo,
      carisma: valorAtributo,
    })
    .optional(),
});

const ATRIBUTOS_PADRAO = {
  forca: 10,
  destreza: 10,
  constituicao: 10,
  inteligencia: 10,
  sabedoria: 10,
  carisma: 10,
};

function camposInvalidos(resultado) {
  return resultado.error.issues.map((problema) => problema.path.join('.'));
}

router.post('/', async (req, res) => {
  const dados = esquemaCriar.safeParse(req.body);
  if (!dados.success) {
    return res.status(400).json({ erro: 'Dados inválidos', campos: camposInvalidos(dados) });
  }

  const { nome, id_raca, id_classe, descricao } = dados.data;
  const nivel = dados.data.nivel ?? 1;
  const xp = dados.data.xp ?? 0;
  const atributos = { ...ATRIBUTOS_PADRAO };
  for (const [chave, valor] of Object.entries(dados.data.atributos || {})) {
    if (valor !== undefined) {
      atributos[chave] = valor;
    }
  }

  let conexao;
  try {
    conexao = await pool.getConnection();

    const [racas] = await conexao.query('SELECT id_raca FROM raca WHERE id_raca = ?', [id_raca]);
    const [classes] = await conexao.query('SELECT id_classe FROM classe WHERE id_classe = ?', [id_classe]);
    if (racas.length === 0 || classes.length === 0) {
      return res.status(400).json({ erro: 'Raça ou classe inválida' });
    }

    await conexao.beginTransaction();

    const [resultado] = await conexao.query(
      `INSERT INTO personagem (id_usuario, id_raca, id_classe, nome, nivel, xp, descricao)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.usuario.id_usuario, id_raca, id_classe, nome, nivel, xp, descricao ?? null]
    );
    const idPersonagem = resultado.insertId;

    await conexao.query(
      `INSERT INTO atributos (id_personagem, forca, destreza, constituicao, inteligencia, sabedoria, carisma)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        idPersonagem,
        atributos.forca,
        atributos.destreza,
        atributos.constituicao,
        atributos.inteligencia,
        atributos.sabedoria,
        atributos.carisma,
      ]
    );

    await conexao.commit();

    res.status(201).json({ id_personagem: idPersonagem, nome, id_raca, id_classe, nivel, xp });
  } catch (erro) {
    if (conexao) {
      await conexao.rollback().catch(() => {});
    }
    console.error('Erro ao criar personagem:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  } finally {
    if (conexao) {
      conexao.release();
    }
  }
});
const esquemaListar = z.object({
  nome: z.string().trim().max(100).optional(),
  id_raca: z.coerce.number().int().positive().optional(),
  id_classe: z.coerce.number().int().positive().optional(),
});

router.get('/', async (req, res) => {
  const filtros = esquemaListar.safeParse(req.query);
  if (!filtros.success) {
    return res.status(400).json({ erro: 'Filtros inválidos', campos: camposInvalidos(filtros) });
  }

  const { nome, id_raca, id_classe } = filtros.data;

  const condicoes = ['p.id_usuario = ?'];
  const valores = [req.usuario.id_usuario];

  if (nome) {
    const padrao = '%' + nome.replace(/[\\%_]/g, '\\$&') + '%';
    condicoes.push('p.nome LIKE ?');
    valores.push(padrao);
  }
  if (id_raca) {
    condicoes.push('p.id_raca = ?');
    valores.push(id_raca);
  }
  if (id_classe) {
    condicoes.push('p.id_classe = ?');
    valores.push(id_classe);
  }

  try {
    const [linhas] = await pool.query(
      `SELECT p.id_personagem, p.nome, p.nivel, p.xp, p.descricao, p.data_criacao,
              r.id_raca, r.nome AS raca,
              c.id_classe, c.nome AS classe
       FROM personagem p
       JOIN raca r ON r.id_raca = p.id_raca
       JOIN classe c ON c.id_classe = p.id_classe
       WHERE ${condicoes.join(' AND ')}
       ORDER BY p.nome`,
      valores
    );
    res.json(linhas);
  } catch (erro) {
    console.error('Erro ao listar personagens:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});
module.exports = router;