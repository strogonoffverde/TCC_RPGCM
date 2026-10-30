const {
  CHAVES_ATRIBUTOS,
  modificador,
  proficiencia,
  calcularAtributosFinais,
  calcularStatus,
} = require('../src/services/status');

const BASE = {
  forca: 5,
  destreza: 15,
  constituicao: 12,
  inteligencia: 20,
  sabedoria: 7,
  carisma: 4,
};

const RACA_DRACONATO = {
  bonus_forca: 2,
  bonus_destreza: 0,
  bonus_constituicao: 0,
  bonus_inteligencia: 0,
  bonus_sabedoria: 0,
  bonus_carisma: 1,
};

describe('CHAVES_ATRIBUTOS', () => {
  test('tem os seis atributos', () => {
    expect(CHAVES_ATRIBUTOS).toHaveLength(6);
    expect(CHAVES_ATRIBUTOS).toEqual(
      expect.arrayContaining([
        'forca',
        'destreza',
        'constituicao',
        'inteligencia',
        'sabedoria',
        'carisma',
      ])
    );
  });
});

describe('modificador', () => {
  test.each([
    [1, -5],
    [7, -2],
    [8, -1],
    [9, -1],
    [10, 0],
    [11, 0],
    [12, 1],
    [15, 2],
    [20, 5],
  ])('valor %i dá modificador %i', (valor, esperado) => {
    expect(modificador(valor)).toBe(esperado);
  });
});

describe('proficiencia', () => {
  test.each([
    [1, 2],
    [4, 2],
    [5, 3],
    [8, 3],
    [9, 4],
    [13, 5],
    [17, 6],
    [20, 6],
  ])('nível %i dá proficiência %i', (nivel, esperado) => {
    expect(proficiencia(nivel)).toBe(esperado);
  });
});

describe('calcularAtributosFinais', () => {
  test('soma o bônus da raça', () => {
    const finais = calcularAtributosFinais({ ...BASE }, RACA_DRACONATO, []);
    expect(finais.forca).toBe(7);
    expect(finais.carisma).toBe(5);
    expect(finais.destreza).toBe(15);
  });

  test('soma o bônus de atributo dos equipamentos equipados', () => {
    const finais = calcularAtributosFinais({ ...BASE }, RACA_DRACONATO, [
      { bonus_atributo: 'forca', bonus_atributo_valor: 1 },
    ]);
    expect(finais.forca).toBe(8);
  });

  test('ignora bônus de atributo desconhecido', () => {
    const semEquipamento = calcularAtributosFinais({ ...BASE }, RACA_DRACONATO, []);
    const comInvalido = calcularAtributosFinais({ ...BASE }, RACA_DRACONATO, [
      { bonus_atributo: 'sorte', bonus_atributo_valor: 5 },
    ]);
    expect(comInvalido).toEqual(semEquipamento);
  });

  test('não altera os atributos base recebidos', () => {
    const base = { ...BASE };
    calcularAtributosFinais(base, RACA_DRACONATO, []);
    expect(base).toEqual(BASE);
  });
});

describe('calcularStatus', () => {
  test('ficha do Davy (guerreiro nível 1)', () => {
    const status = calcularStatus({
      nivel: 1,
      classe: { vida_base: 10, mana_base: 0 },
      atributosFinais: {
        forca: 7,
        destreza: 15,
        constituicao: 12,
        inteligencia: 20,
        sabedoria: 7,
        carisma: 5,
      },
      equipamentos: [],
    });

    expect(status).toMatchObject({ hp: 11, mana: 5, defesa: 12, ataque: 4, proficiencia: 2 });
    expect(status.modificadores.forca).toBe(-2);
    expect(status.modificadores.inteligencia).toBe(5);
  });

  test('exemplo aprovado: nível 3, vida base 10 e mana base 4', () => {
    const status = calcularStatus({
      nivel: 3,
      classe: { vida_base: 10, mana_base: 4 },
      atributosFinais: {
        forca: 16,
        destreza: 14,
        constituicao: 14,
        inteligencia: 10,
        sabedoria: 12,
        carisma: 8,
      },
      equipamentos: [],
    });

    expect(status).toMatchObject({ hp: 26, mana: 7, defesa: 12, ataque: 5, proficiencia: 2 });
  });

  test('soma os bônus de ataque e defesa dos equipamentos', () => {
    const status = calcularStatus({
      nivel: 1,
      classe: { vida_base: 10, mana_base: 0 },
      atributosFinais: {
        forca: 7,
        destreza: 15,
        constituicao: 12,
        inteligencia: 20,
        sabedoria: 7,
        carisma: 5,
      },
      equipamentos: [{ bonus_ataque: 2, bonus_defesa: 1 }],
    });

    expect(status.ataque).toBe(6);
    expect(status.defesa).toBe(13);
  });

  test('o HP nunca fica abaixo de 1', () => {
    const status = calcularStatus({
      nivel: 1,
      classe: { vida_base: 2, mana_base: 0 },
      atributosFinais: {
        forca: 10,
        destreza: 10,
        constituicao: 1,
        inteligencia: 10,
        sabedoria: 10,
        carisma: 10,
      },
      equipamentos: [],
    });

    expect(status.hp).toBe(1);
  });

  test('modificador mental negativo não reduz a mana base', () => {
    const status = calcularStatus({
      nivel: 5,
      classe: { vida_base: 8, mana_base: 4 },
      atributosFinais: {
        forca: 10,
        destreza: 10,
        constituicao: 10,
        inteligencia: 8,
        sabedoria: 8,
        carisma: 8,
      },
      equipamentos: [],
    });

    expect(status.mana).toBe(4);
  });
});