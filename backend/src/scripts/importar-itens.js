require('dotenv').config();
const pool = require('../config/db');

const BASE_URL = 'https://www.dnd5eapi.co/api/2014';

const ITENS_DA_API = [
  [['dagger'], 'Adaga', 'arma'],
  [['club'], 'Clava', 'arma'],
  [['handaxe'], 'Machadinha', 'arma'],
  [['spear'], 'Lança', 'arma'],
  [['mace'], 'Maça', 'arma'],
  [['quarterstaff'], 'Bordão', 'arma'],
  [['shortsword'], 'Espada curta', 'arma'],
  [['longsword'], 'Espada longa', 'arma'],
  [['rapier'], 'Rapieira', 'arma'],
  [['battleaxe'], 'Machado de batalha', 'arma'],
  [['warhammer'], 'Martelo de guerra', 'arma'],
  [['greatsword'], 'Espada grande', 'arma'],
  [['greataxe'], 'Machado grande', 'arma'],
  [['shortbow'], 'Arco curto', 'arma'],
  [['longbow'], 'Arco longo', 'arma'],
  [['crossbow-light', 'light-crossbow'], 'Besta leve', 'arma'],
  [['padded-armor', 'padded'], 'Armadura acolchoada', 'armadura'],
  [['leather-armor', 'leather'], 'Armadura de couro', 'armadura'],
  [['studded-leather-armor', 'studded-leather'], 'Couro batido', 'armadura'],
  [['chain-shirt'], 'Camisa de malha', 'armadura'],
  [['chain-mail'], 'Cota de malha', 'armadura'],
  [['breastplate'], 'Peitoral', 'armadura'],
  [['plate-armor', 'plate'], 'Armadura de placas', 'armadura'],
  [['shield'], 'Escudo', 'armadura'],
  [['backpack'], 'Mochila', 'equipamento', 'Mochila para carregar equipamento de aventura.'],
  [['torch'], 'Tocha', 'equipamento', 'Fornece luz por cerca de 1 hora.'],
  [['rations-1-day'], 'Ração de viagem (1 dia)', 'equipamento', 'Comida seca suficiente para um dia de viagem.'],
  [['waterskin'], 'Odre de água', 'equipamento', 'Recipiente para carregar água.'],
  [['bedroll'], 'Saco de dormir', 'equipamento', 'Saco de dormir para descansar ao relento.'],
  [['rope-hempen-50-feet', 'rope-hemp-50-feet'], 'Corda de cânhamo (15 m)', 'equipamento', 'Corda de cânhamo com cerca de 15 metros.'],
  [['healers-kit'], 'Kit de curandeiro', 'equipamento', 'Kit com ataduras e ervas para estabilizar um aliado ferido.'],
  [['antitoxin-vial'], 'Antitoxina (frasco)', 'poção', 'Frasco que ajuda a resistir a venenos.'],
  [['oil-flask'], 'Óleo (frasco)', 'material', 'Frasco de óleo, usado em lampiões ou como arma incendiária.'],
  [['alchemists-fire-flask'], 'Fogo do alquimista (frasco)', 'material', 'Frasco de líquido inflamável que pega fogo ao contato com o ar.'],
  [['holy-water-flask'], 'Água benta (frasco)', 'material', 'Frasco de água benta, eficaz contra mortos-vivos e demônios.'],
  [['acid-vial'], 'Ácido (frasco)', 'material', 'Frasco de ácido corrosivo que pode ser arremessado.'],
];

const ITENS_PROPRIOS = [
  ['Poção de cura', 'poção', 'Restaura pontos de vida quando bebida. Item próprio do RPGCM.', 50],
  ['Poção de mana', 'poção', 'Restaura pontos de mana quando bebida. Item próprio do RPGCM.', 50],
];

const UNIDADES_EM_OURO = { cp: 0.01, sp: 0.1, ep: 0.5, gp: 1, pp: 10 };

const TIPOS_DE_DANO = {
  slashing: 'cortante',
  piercing: 'perfurante',
  bludgeoning: 'contundente',
};

async function buscar(caminho) {
  const resposta = await fetch(`${BASE_URL}${caminho}`);
  if (!resposta.ok) {
    throw new Error(`Falha ao consultar ${caminho}: ${resposta.status}`);
  }
  return resposta.json();
}

function valorEmOuro(custo) {
  if (!custo || !(custo.unit in UNIDADES_EM_OURO)) {
    return 0;
  }
  return Math.round(custo.quantity * UNIDADES_EM_OURO[custo.unit] * 100) / 100;
}

function montarDescricao(detalhe, tipo, descricaoPadrao) {
  if (tipo === 'arma' && detalhe.damage && detalhe.damage.damage_dice) {
    const indiceDano = detalhe.damage.damage_type && detalhe.damage.damage_type.index;
    const tipoDano = TIPOS_DE_DANO[indiceDano] || 'de tipo não informado';
    return `Dano ${detalhe.damage.damage_dice} ${tipoDano}.`;
  }

  if (tipo === 'armadura' && detalhe.armor_class && detalhe.armor_class.base !== undefined) {
    const { base, dex_bonus, max_bonus } = detalhe.armor_class;
    if (detalhe.armor_category === 'Shield') {
      return `Bônus de +${base} na defesa.`;
    }
    const limite = max_bonus ? ` (máx. +${max_bonus})` : '';
    const destreza = dex_bonus ? ` + modificador de Destreza${limite}` : '';
    return `Defesa base ${base}${destreza}.`;
  }

  return descricaoPadrao || 'Item de aventura.';
}

async function gravar(dados) {
  const [existente] = await pool.query('SELECT id_item FROM item WHERE nome = ?', [dados.nome]);
  if (existente.length > 0) {
    await pool.query('UPDATE item SET ? WHERE id_item = ?', [dados, existente[0].id_item]);
  } else {
    await pool.query('INSERT INTO item SET ?', [dados]);
  }
}

async function main() {
  let problemas = 0;
  try {
    const lista = await buscar('/equipment');
    const indicesValidos = new Set(lista.results.map((e) => e.index));

    for (const [indices, nome, tipo, descricaoPadrao] of ITENS_DA_API) {
      try {
        const indice = indices.find((i) => indicesValidos.has(i));
        if (!indice) {
          const parte = indices[0].split('-')[0];
          const parecidos = lista.results
            .filter((e) => e.index.includes(parte))
            .map((e) => e.index)
            .slice(0, 8);
          throw new Error(`índice não encontrado. Parecidos: ${parecidos.join(', ') || 'nenhum'}`);
        }

        const detalhe = await buscar(`/equipment/${indice}`);
        await gravar({
          nome,
          descricao: `${montarDescricao(detalhe, tipo, descricaoPadrao)} Fonte: D&D 5e SRD (2014).`,
          tipo,
          valor: valorEmOuro(detalhe.cost),
        });
        console.log(`Item salvo: ${nome}`);
      } catch (erro) {
        problemas += 1;
        console.error(`Não foi possível importar "${nome}":`, erro.message);
      }
    }

    for (const [nome, tipo, descricao, valor] of ITENS_PROPRIOS) {
      await gravar({ nome, descricao, tipo, valor });
      console.log(`Item próprio salvo: ${nome}`);
    }

    console.log(`Importação concluída. Itens com problema: ${problemas}.`);
  } catch (erro) {
    console.error('Erro na importação:', erro.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();