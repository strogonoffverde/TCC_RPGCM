
const CHAVES_ATRIBUTOS = [
  'forca',
  'destreza',
  'constituicao',
  'inteligencia',
  'sabedoria',
  'carisma',
];

function modificador(valor) {
  return Math.floor((valor - 10) / 2);
}

function proficiencia(nivel) {
  return 2 + Math.floor((nivel - 1) / 4);
}

function somar(lista, campo) {
  return lista.reduce((total, item) => total + (Number(item[campo]) || 0), 0);
}

function calcularAtributosFinais(base, raca, equipamentosEquipados = []) {
  const finais = {};

  for (const chave of CHAVES_ATRIBUTOS) {
    finais[chave] = Number(base[chave]) + (Number(raca['bonus_' + chave]) || 0);
  }

  for (const equipamento of equipamentosEquipados) {
    const chave = equipamento.bonus_atributo;
    if (CHAVES_ATRIBUTOS.includes(chave)) {
      finais[chave] += Number(equipamento.bonus_atributo_valor) || 0;
    }
  }

  return finais;
}

function calcularStatus({ nivel, classe, atributosFinais, equipamentos = [] }) {
  const mods = {};
  for (const chave of CHAVES_ATRIBUTOS) {
    mods[chave] = modificador(atributosFinais[chave]);
  }

  const prof = proficiencia(nivel);

  const defesa = 10 + mods.destreza + somar(equipamentos, 'bonus_defesa');

  const ataque =
    prof +
    Math.max(mods.forca, mods.destreza) +
    somar(equipamentos, 'bonus_ataque');

  const hp = Math.max(
    1,
    classe.vida_base + mods.constituicao * nivel + 5 * (nivel - 1)
  );

  const maiorModMagico = Math.max(0, mods.inteligencia, mods.sabedoria, mods.carisma);
  const mana = classe.mana_base + nivel * maiorModMagico;

  return {
    modificadores: mods,
    proficiencia: prof,
    defesa,
    ataque,
    hp,
    mana,
  };
}

module.exports = {
  CHAVES_ATRIBUTOS,
  modificador,
  proficiencia,
  calcularAtributosFinais,
  calcularStatus,
};