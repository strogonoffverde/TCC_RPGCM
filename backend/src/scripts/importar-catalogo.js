require('dotenv').config();
const pool = require('../config/db');

const BASE_URL = 'https://www.dnd5eapi.co/api/2014';

const NOMES_RACAS = {
  dragonborn: 'Draconato', dwarf: 'Anão', elf: 'Elfo', gnome: 'Gnomo',
  'half-elf': 'Meio-elfo', 'half-orc': 'Meio-orc', halfling: 'Halfling',
  human: 'Humano', tiefling: 'Tiefling',
};

const NOMES_CLASSES = {
  barbarian: 'Bárbaro', bard: 'Bardo', cleric: 'Clérigo', druid: 'Druida',
  fighter: 'Guerreiro', monk: 'Monge', paladin: 'Paladino', ranger: 'Patrulheiro',
  rogue: 'Ladino', sorcerer: 'Feiticeiro', warlock: 'Bruxo', wizard: 'Mago',
};

const TAMANHOS = { Small: 'Pequeno', Medium: 'Médio' };

const MANA_BASE = {
  barbarian: 0, bard: 8, cleric: 8, druid: 8, fighter: 0, monk: 2,
  paladin: 4, ranger: 4, rogue: 0, sorcerer: 10, warlock: 8, wizard: 10,
};

const COLUNA_ATRIBUTO = {
  str: 'bonus_forca', dex: 'bonus_destreza', con: 'bonus_constituicao',
  int: 'bonus_inteligencia', wis: 'bonus_sabedoria', cha: 'bonus_carisma',
};

async function buscar(caminho) {
  const resposta = await fetch(`${BASE_URL}${caminho}`);
  if (!resposta.ok) {
    throw new Error(`Falha ao consultar ${caminho}: ${resposta.status}`);
  }
  return resposta.json();
}

async function salvarRaca(raca) {
  const dados = {
    nome: NOMES_RACAS[raca.index] || raca.name,
    descricao: `Tamanho: ${TAMANHOS[raca.size] || raca.size}. Deslocamento: ${raca.speed} pés.`,
    bonus_forca: 0,
    bonus_destreza: 0,
    bonus_constituicao: 0,
    bonus_inteligencia: 0,
    bonus_sabedoria: 0,
    bonus_carisma: 0,
  };

  for (const item of raca.ability_bonuses || []) {
    const coluna = COLUNA_ATRIBUTO[item.ability_score.index];
    if (coluna) {
      dados[coluna] = item.bonus;
    }
  }

  const [existente] = await pool.query('SELECT id_raca FROM raca WHERE nome = ?', [dados.nome]);
  if (existente.length > 0) {
    await pool.query('UPDATE raca SET ? WHERE id_raca = ?', [dados, existente[0].id_raca]);
  } else {
    await pool.query('INSERT INTO raca SET ?', [dados]);
  }
}

async function salvarClasse(classe) {
  const dados = {
    nome: NOMES_CLASSES[classe.index] || classe.name,
    descricao: `Dado de vida d${classe.hit_die}. Fonte: D&D 5e SRD (2014).`,
    vida_base: classe.hit_die,
    mana_base: MANA_BASE[classe.index] ?? 0,
  };

  const [existente] = await pool.query('SELECT id_classe FROM classe WHERE nome = ?', [dados.nome]);
  if (existente.length > 0) {
    await pool.query('UPDATE classe SET ? WHERE id_classe = ?', [dados, existente[0].id_classe]);
  } else {
    await pool.query('INSERT INTO classe SET ?', [dados]);
  }
}

async function main() {
  try {
    const racas = await buscar('/races');
    for (const item of racas.results) {
      const detalhe = await buscar(`/races/${item.index}`);
      await salvarRaca(detalhe);
      console.log(`Raça salva: ${detalhe.name}`);
    }

    const classes = await buscar('/classes');
    for (const item of classes.results) {
      const detalhe = await buscar(`/classes/${item.index}`);
      await salvarClasse(detalhe);
      console.log(`Classe salva: ${detalhe.name}`);
    }

    console.log('Catálogo importado com sucesso.');
  } catch (erro) {
    console.error('Erro na importação:', erro.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();