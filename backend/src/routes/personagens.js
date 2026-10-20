const express = require('express');
const { z } = require('zod');
const pool = require('../config/db');
const autenticar = require('../middlewares/autenticar');
const { CHAVES_ATRIBUTOS, calcularAtributosFinais, calcularStatus } = require('../services/status');

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
const esquemaId = z.coerce.number().int().positive();

router.get('/:id', async (req, res) => {
  const id = esquemaId.safeParse(req.params.id);
  if (!id.success) {
    return res.status(400).json({ erro: 'Identificador inválido' });
  }
  const idPersonagem = id.data;

  try {
    // O filtro por id_usuario vem do token: só o dono vê a ficha.
    const [linhas] = await pool.query(
      `SELECT p.id_personagem, p.nome, p.nivel, p.xp, p.descricao, p.data_criacao,
              r.id_raca, r.nome AS raca,
              r.bonus_forca, r.bonus_destreza, r.bonus_constituicao,
              r.bonus_inteligencia, r.bonus_sabedoria, r.bonus_carisma,
              c.id_classe, c.nome AS classe, c.vida_base, c.mana_base,
              a.forca, a.destreza, a.constituicao, a.inteligencia, a.sabedoria, a.carisma
       FROM personagem p
       JOIN raca r ON r.id_raca = p.id_raca
       JOIN classe c ON c.id_classe = p.id_classe
       JOIN atributos a ON a.id_personagem = p.id_personagem
       WHERE p.id_personagem = ? AND p.id_usuario = ?`,
      [idPersonagem, req.usuario.id_usuario]
    );

    if (linhas.length === 0) {
      return res.status(404).json({ erro: 'Personagem não encontrado' });
    }
    const p = linhas[0];

    const [equipados] = await pool.query(
      `SELECT e.id_equipamento, i.nome, e.bonus_ataque, e.bonus_defesa,
              e.bonus_atributo, e.bonus_atributo_valor
       FROM personagem_equipamento pe
       JOIN equipamento e ON e.id_equipamento = pe.id_equipamento
       JOIN item i ON i.id_item = e.id_item
       WHERE pe.id_personagem = ? AND pe.equipado = 1`,
      [idPersonagem]
    );

    const atributosBase = {};
    for (const chave of CHAVES_ATRIBUTOS) {
      atributosBase[chave] = p[chave];
    }

    const atributosFinais = calcularAtributosFinais(atributosBase, p, equipados);

    const status = calcularStatus({
      nivel: p.nivel,
      classe: { vida_base: p.vida_base, mana_base: p.mana_base },
      atributosFinais,
      equipamentos: equipados,
    });

    res.json({
      id_personagem: p.id_personagem,
      nome: p.nome,
      nivel: p.nivel,
      xp: p.xp,
      descricao: p.descricao,
      data_criacao: p.data_criacao,
      raca: { id_raca: p.id_raca, nome: p.raca },
      classe: { id_classe: p.id_classe, nome: p.classe },
      atributos_base: atributosBase,
      atributos_finais: atributosFinais,
      equipamentos_equipados: equipados,
      status,
    });
  } catch (erro) {
    console.error('Erro ao buscar personagem:', erro.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});
module.exports = router;