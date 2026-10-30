const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');
const { criarUsuario, limparUsuarios, cabecalho, sucesso } = require('./auxiliar');

let dono;
let outro;
let idPersonagem;
let arma;
let armadura;
let ataqueInicial;
let defesaInicial;

function caminho(sufixo = '') {
  return `/api/personagens/${idPersonagem}${sufixo}`;
}

async function ficha() {
  const res = await request(app).get(caminho()).set(cabecalho(dono.token));
  return res.body;
}

beforeAll(async () => {
  dono = await criarUsuario('inv-dono');
  outro = await criarUsuario('inv-outro');

  const [racas] = await pool.query('SELECT id_raca FROM raca ORDER BY id_raca LIMIT 1');
  const [classes] = await pool.query('SELECT id_classe FROM classe ORDER BY id_classe LIMIT 1');

  const criado = await request(app)
    .post('/api/personagens')
    .set(cabecalho(dono.token))
    .send({ nome: 'Equipado Teste', id_raca: racas[0].id_raca, id_classe: classes[0].id_classe });
  idPersonagem = criado.body.id_personagem;

  const [armas] = await pool.query(
    'SELECT id_equipamento, id_item, bonus_ataque FROM equipamento WHERE bonus_ataque > 0 ORDER BY id_equipamento LIMIT 1'
  );
  const [armaduras] = await pool.query(
    'SELECT id_equipamento, id_item, bonus_defesa FROM equipamento WHERE bonus_defesa > 0 ORDER BY id_equipamento LIMIT 1'
  );
  arma = armas[0];
  armadura = armaduras[0];

  const inicial = await ficha();
  ataqueInicial = inicial.status.ataque;
  defesaInicial = inicial.status.defesa;
});

afterAll(async () => {
  await limparUsuarios([dono && dono.email, outro && outro.email]);
  await pool.end();
});

describe('inventário', () => {
  test('adiciona um item', async () => {
    const res = await request(app)
      .post(caminho('/inventario'))
      .set(cabecalho(dono.token))
      .send({ id_item: arma.id_item, quantidade: 1 });
    sucesso(res);
  });

  test('lista o item adicionado', async () => {
    const res = await request(app).get(caminho('/inventario')).set(cabecalho(dono.token));

    expect(res.statusCode).toBe(200);
    const item = res.body.find((i) => i.id_item === arma.id_item);
    expect(item).toBeDefined();
    expect(item.quantidade).toBe(1);
  });

  test('altera a quantidade', async () => {
    const res = await request(app)
      .put(caminho(`/inventario/${arma.id_item}`))
      .set(cabecalho(dono.token))
      .send({ quantidade: 3 });
    sucesso(res);

    const lista = await request(app).get(caminho('/inventario')).set(cabecalho(dono.token));
    const item = lista.body.find((i) => i.id_item === arma.id_item);
    expect(item.quantidade).toBe(3);
  });

  test('recusa item que não existe', async () => {
    const res = await request(app)
      .post(caminho('/inventario'))
      .set(cabecalho(dono.token))
      .send({ id_item: 999999, quantidade: 1 });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.statusCode).toBeLessThan(500);
  });

  test('recusa quantidade zero', async () => {
    const res = await request(app)
      .post(caminho('/inventario'))
      .set(cabecalho(dono.token))
      .send({ id_item: arma.id_item, quantidade: 0 });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.statusCode).toBeLessThan(500);
  });

  test('outro usuário não acessa o inventário', async () => {
    const res = await request(app).get(caminho('/inventario')).set(cabecalho(outro.token));
    expect(res.statusCode).toBe(404);
  });
});

describe('equipamentos', () => {
  test('a arma do inventário aparece como disponível', async () => {
    const res = await request(app).get(caminho('/equipamentos')).set(cabecalho(dono.token));

    expect(res.statusCode).toBe(200);
    expect(res.body.equipados).toHaveLength(0);
    expect(
      res.body.disponiveis.some((e) => e.id_equipamento === arma.id_equipamento)
    ).toBe(true);
  });

  test('recusa equipar o que não está no inventário', async () => {
    const res = await request(app)
      .post(caminho('/equipamentos'))
      .set(cabecalho(dono.token))
      .send({ id_equipamento: armadura.id_equipamento });
    expect(res.statusCode).toBe(400);
  });

  test('equipa a arma e o ataque sobe', async () => {
    const res = await request(app)
      .post(caminho('/equipamentos'))
      .set(cabecalho(dono.token))
      .send({ id_equipamento: arma.id_equipamento });
    expect(res.statusCode).toBe(201);

    const depois = await ficha();
    expect(depois.status.ataque).toBe(ataqueInicial + arma.bonus_ataque);
    expect(depois.equipamentos_equipados).toHaveLength(1);
  });

  test('recusa equipar duas vezes', async () => {
    const res = await request(app)
      .post(caminho('/equipamentos'))
      .set(cabecalho(dono.token))
      .send({ id_equipamento: arma.id_equipamento });
    expect(res.statusCode).toBe(409);
  });

  test('desequipa e o ataque volta ao valor inicial', async () => {
    const res = await request(app)
      .delete(caminho(`/equipamentos/${arma.id_equipamento}`))
      .set(cabecalho(dono.token));
    expect(res.statusCode).toBe(200);

    const depois = await ficha();
    expect(depois.status.ataque).toBe(ataqueInicial);
  });

  test('desequipar o que não está equipado responde 404', async () => {
    const res = await request(app)
      .delete(caminho(`/equipamentos/${arma.id_equipamento}`))
      .set(cabecalho(dono.token));
    expect(res.statusCode).toBe(404);
  });

  test('remover do inventário desequipa o item (gatilho do banco)', async () => {
    const equipar = await request(app)
      .post(caminho('/equipamentos'))
      .set(cabecalho(dono.token))
      .send({ id_equipamento: arma.id_equipamento });
    expect(equipar.statusCode).toBe(201);

    const remover = await request(app)
      .delete(caminho(`/inventario/${arma.id_item}`))
      .set(cabecalho(dono.token));
    sucesso(remover);

    const lista = await request(app).get(caminho('/equipamentos')).set(cabecalho(dono.token));
    expect(lista.body.equipados).toHaveLength(0);

    const depois = await ficha();
    expect(depois.status.ataque).toBe(ataqueInicial);
  });

  test('a armadura equipada aumenta a defesa', async () => {
    const adicionar = await request(app)
      .post(caminho('/inventario'))
      .set(cabecalho(dono.token))
      .send({ id_item: armadura.id_item, quantidade: 1 });
    sucesso(adicionar);

    const equipar = await request(app)
      .post(caminho('/equipamentos'))
      .set(cabecalho(dono.token))
      .send({ id_equipamento: armadura.id_equipamento });
    expect(equipar.statusCode).toBe(201);

    const depois = await ficha();
    expect(depois.status.defesa).toBe(defesaInicial + armadura.bonus_defesa);
  });

  test('outro usuário não acessa os equipamentos', async () => {
    const res = await request(app).get(caminho('/equipamentos')).set(cabecalho(outro.token));
    expect(res.statusCode).toBe(404);
  });
});