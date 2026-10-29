require('dotenv').config();
const pool = require('../config/db');

function calcularBonus(descricao) {
  const texto = descricao || '';
  const armadura = texto.match(/Defesa base (\d+)/i);
  const escudo = texto.match(/Bônus de \+(\d+) na defesa/i);
  const dano = texto.match(/Dano (\d+)d(\d+)/i);

  const bonus = {
    bonus_ataque: 0,
    bonus_defesa: 0,
    bonus_atributo: null,
    bonus_atributo_valor: 0,
  };

  if (armadura) {
    bonus.bonus_defesa = Math.max(Number(armadura[1]) - 10, 0);
  } else if (escudo) {
    bonus.bonus_defesa = Number(escudo[1]);
  } else if (dano) {
    const maximo = Number(dano[1]) * Number(dano[2]);
    bonus.bonus_ataque = Math.max(Math.floor(maximo / 4), 1);
  } else {
    return null;
  }

  return bonus;
}

async function main() {
  try {
    const [itens] = await pool.query('SELECT id_item, nome, descricao FROM item ORDER BY nome');
    const ignorados = [];
    let salvos = 0;

    for (const item of itens) {
      const bonus = calcularBonus(item.descricao);
      if (!bonus) {
        ignorados.push(item.nome);
        continue;
      }

      const [existente] = await pool.query(
        'SELECT id_equipamento FROM equipamento WHERE id_item = ?',
        [item.id_item]
      );
      if (existente.length > 0) {
        await pool.query('UPDATE equipamento SET ? WHERE id_equipamento = ?', [bonus, existente[0].id_equipamento]);
      } else {
        await pool.query('INSERT INTO equipamento SET ?', [{ id_item: item.id_item, ...bonus }]);
      }

      salvos += 1;
      console.log(`Equipamento salvo: ${item.nome} (ataque +${bonus.bonus_ataque}, defesa +${bonus.bonus_defesa})`);
    }

    console.log(`${salvos} equipamentos salvos.`);
    if (ignorados.length > 0) {
      console.log(`Itens que não são equipamentos: ${ignorados.join(', ')}`);
    }
  } catch (erro) {
    console.error('Erro na importação:', erro.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();