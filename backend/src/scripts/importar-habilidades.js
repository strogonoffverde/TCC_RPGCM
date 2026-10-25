require('dotenv').config();
const pool = require('../config/db');

const BASE_URL = 'https://www.dnd5eapi.co/api/2014';

function custoDeMana(nivelMagia) {
  return nivelMagia === 0 ? 0 : nivelMagia * 2;
}

function nivelMinimo(nivelMagia) {
  return nivelMagia === 0 ? 1 : nivelMagia * 2 - 1;
}

const HABILIDADES = [
  ['fire-bolt', 'Raio de fogo', 'ofensiva', 'Dispara um raio de fogo em um alvo à distância.'],
  ['ray-of-frost', 'Raio de gelo', 'ofensiva', 'Raio gelado que causa dano e reduz a velocidade do alvo.'],
  ['sacred-flame', 'Chama sagrada', 'ofensiva', 'Chama radiante que desce sobre um alvo visível.'],
  ['eldritch-blast', 'Rajada mística', 'ofensiva', 'Feixe de energia sombria que atinge um alvo à distância.'],
  ['vicious-mockery', 'Zombaria viciosa', 'ofensiva', 'Insulto mágico que causa dano psíquico e atrapalha o alvo.'],
  ['mage-hand', 'Mãos mágicas', 'suporte', 'Mão espectral que manipula objetos à distância.'],
  ['light', 'Luz', 'suporte', 'Faz um objeto emitir luz por cerca de 1 hora.'],
  ['magic-missile', 'Mísseis mágicos', 'ofensiva', 'Dardos de energia que sempre acertam o alvo.'],
  ['cure-wounds', 'Curar ferimentos', 'suporte', 'Restaura pontos de vida de uma criatura que você toca.'],
  ['shield', 'Escudo arcano', 'defensiva', 'Barreira invisível que aumenta a defesa por um instante.'],
  ['mage-armor', 'Armadura arcana', 'defensiva', 'Cobre uma criatura sem armadura com uma proteção mágica.'],
  ['healing-word', 'Palavra de cura', 'suporte', 'Cura um aliado à distância com uma palavra de poder.'],
  ['bless', 'Bênção', 'suporte', 'Abençoa aliados, ajudando em ataques e testes de resistência.'],
  ['burning-hands', 'Mãos flamejantes', 'ofensiva', 'Leque de chamas à sua frente que queima as criaturas atingidas.'],
  ['thunderwave', 'Onda trovejante', 'ofensiva', 'Onda de trovão que causa dano e empurra criaturas próximas.'],
  ['sleep', 'Sono', 'ofensiva', 'Faz criaturas fracas caírem em sono mágico.'],
  ['misty-step', 'Passo nebuloso', 'suporte', 'Teletransporta você a curta distância, envolto em névoa.'],
  ['hold-person', 'Imobilizar pessoa', 'ofensiva', 'Paralisa uma criatura humanoide.'],
  ['invisibility', 'Invisibilidade', 'suporte', 'Torna uma criatura invisível por um tempo.'],
  ['scorching-ray', 'Raio ardente', 'ofensiva', 'Lança raios flamejantes contra um ou mais alvos.'],
  ['lesser-restoration', 'Restauração menor', 'suporte', 'Cura uma doença ou condição que afeta uma criatura.'],
  ['fireball', 'Bola de fogo', 'ofensiva', 'Explosão de fogo em área que atinge todos ao redor.'],
  ['lightning-bolt', 'Relâmpago', 'ofensiva', 'Relâmpago em linha reta que atravessa os alvos.'],
  ['counterspell', 'Contramágica', 'defensiva', 'Interrompe uma magia que outra criatura está lançando.'],
  ['revivify', 'Revivificar', 'suporte', 'Traz de volta à vida uma criatura que morreu há pouco tempo.'],
  ['fly', 'Voo', 'suporte', 'Concede a uma criatura a capacidade de voar.'],
  ['haste', 'Velocidade', 'suporte', 'Deixa uma criatura muito mais rápida por um tempo.'],
  ['greater-invisibility', 'Invisibilidade maior', 'suporte', 'Invisibilidade que continua mesmo ao atacar.'],
  ['ice-storm', 'Tempestade de gelo', 'ofensiva', 'Chuva de gelo e granizo que castiga uma área.'],
  ['polymorph', 'Metamorfose', 'suporte', 'Transforma uma criatura em outra forma de animal.'],
  ['cone-of-cold', 'Cone de frio', 'ofensiva', 'Rajada de frio intenso em formato de cone.'],
  ['raise-dead', 'Reviver os mortos', 'suporte', 'Devolve a vida a uma criatura morta há poucos dias.'],
  ['chain-lightning', 'Relâmpago em cadeia', 'ofensiva', 'Relâmpago que salta de um alvo para outros.'],
  ['heal', 'Cura completa', 'suporte', 'Cura poderosa que restaura muitos pontos de vida.'],
  ['meteor-swarm', 'Chuva de meteoros', 'ofensiva', 'Esferas de fogo caem do céu e devastam uma enorme área.'],
];

async function buscar(caminho) {
  const resposta = await fetch(`${BASE_URL}${caminho}`);
  if (!resposta.ok) {
    throw new Error(`Falha ao consultar ${caminho}: ${resposta.status}`);
  }
  return resposta.json();
}

async function gravar(dados) {
  const [existente] = await pool.query('SELECT id_habilidade FROM habilidade WHERE nome = ?', [dados.nome]);
  if (existente.length > 0) {
    await pool.query('UPDATE habilidade SET ? WHERE id_habilidade = ?', [dados, existente[0].id_habilidade]);
  } else {
    await pool.query('INSERT INTO habilidade SET ?', [dados]);
  }
}

async function main() {
  let problemas = 0;
  try {
    const lista = await buscar('/spells');
    const indicesValidos = new Set(lista.results.map((e) => e.index));

    for (const [indice, nome, tipo, descricao] of HABILIDADES) {
      try {
        if (!indicesValidos.has(indice)) {
          const parte = indice.split('-')[0];
          const parecidos = lista.results
            .filter((e) => e.index.includes(parte))
            .map((e) => e.index)
            .slice(0, 8);
          throw new Error(`índice não encontrado. Parecidos: ${parecidos.join(', ') || 'nenhum'}`);
        }

        const detalhe = await buscar(`/spells/${indice}`);
        const nivelMagia = Number(detalhe.level);
        if (Number.isNaN(nivelMagia)) {
          throw new Error('a API não informou o nível da magia');
        }

        const origem = nivelMagia === 0 ? 'Truque' : `Magia de nível ${nivelMagia}`;
        await gravar({
          nome,
          descricao: `${descricao} ${origem} no D&D 5e SRD (2014).`,
          tipo,
          custo_mana: custoDeMana(nivelMagia),
          nivel_minimo: nivelMinimo(nivelMagia),
        });
        console.log(`Habilidade salva: ${nome}`);
      } catch (erro) {
        problemas += 1;
        console.error(`Não foi possível importar "${nome}":`, erro.message);
      }
    }

    console.log(`Importação concluída. Habilidades com problema: ${problemas}.`);
  } catch (erro) {
    console.error('Erro na importação:', erro.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();