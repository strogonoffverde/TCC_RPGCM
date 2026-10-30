const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');
const { criarUsuario, limparUsuarios, cabecalho } = require('./auxiliar');

let dono;
let outro;
let idRaca;
let idClasse;
let idPersonagem;

beforeAll(async () => {
  dono = await criarUsuario('pers-dono');
  outro = await criarUsuario('pers-outro');

  const [racas] = await pool.query('SELECT id_raca FROM raca ORDER BY id_raca LIMIT 1');
  const [classes] = await pool.query('SELECT id_classe FROM classe ORDER BY id_classe LIMIT 1');
  idRaca = racas[0].id_raca;
  idClasse = classes[0].id_classe;
});

afterAll(async () => {
  await limparUsuarios([dono && dono.email, outro && outro.email]);
  await pool.end();
});

describe('autenticação', () => {
  test('listar exige token', async () => {
    const res = await request(app).get('/api/personagens');
    expect(res.statusCode).toBe(401);
  });

  test('criar exige token', async () => {
    const res = await request(app)
      .post('/api/personagens')
      .send({ nome: 'Sem Token', id_raca: idRaca, id_classe: idClasse });
    expect(res.statusCode).toBe(401);
  });
});

describe('criação', () => {
  test('cria um personagem válido', async () => {
    const res = await request(app)
      .post('/api/personagens')
      .set(cabecalho(dono.token))
      .send({
        nome: 'Heroi Teste',
        id_raca: idRaca,
        id_classe: idClasse,
        nivel: 3,
        xp: 100,
        atributos: { forca: 16 },
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.id_personagem).toBeGreaterThan(0);
    idPersonagem = res.body.id_personagem;
  });

  test('recusa nível acima do limite', async () => {
    const res = await request(app)
      .post('/api/personagens')
      .set(cabecalho(dono.token))
      .send({ nome: 'Nivel Alto', id_raca: idRaca, id_classe: idClasse, nivel: 21 });

    expect(res.statusCode).toBe(400);
    expect(res.body.campos).toContain('nivel');
  });

  test('recusa nome curto', async () => {
    const res = await request(app)
      .post('/api/personagens')
      .set(cabecalho(dono.token))
      .send({ nome: 'A', id_raca: idRaca, id_classe: idClasse });

    expect(res.statusCode).toBe(400);
    expect(res.body.campos).toContain('nome');
  });

  test('recusa atributo acima de 20', async () => {
    const res = await request(app)
      .post('/api/personagens')
      .set(cabecalho(dono.token))
      .send({
        nome: 'Forte Demais',
        id_raca: idRaca,
        id_classe: idClasse,
        atributos: { forca: 25 },
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.campos).toContain('atributos.forca');
  });

  test('recusa raça que não existe', async () => {
    const res = await request(app)
      .post('/api/personagens')
      .set(cabecalho(dono.token))
      .send({ nome: 'Sem Raca', id_raca: 999999, id_classe: idClasse });

    expect(res.statusCode).toBe(400);
  });
});

describe('listagem e filtros', () => {
  test('lista o personagem do dono', async () => {
    const res = await request(app).get('/api/personagens').set(cabecalho(dono.token));

    expect(res.statusCode).toBe(200);
    const achado = res.body.find((p) => p.id_personagem === idPersonagem);
    expect(achado).toBeDefined();
    expect(achado.nome).toBe('Heroi Teste');
  });

  test('filtra por nome', async () => {
    const res = await request(app)
      .get('/api/personagens')
      .query({ nome: 'Heroi' })
      .set(cabecalho(dono.token));

    expect(res.statusCode).toBe(200);
    expect(res.body.some((p) => p.id_personagem === idPersonagem)).toBe(true);
  });

  test('filtro por nome sem resultado devolve lista vazia', async () => {
    const res = await request(app)
      .get('/api/personagens')
      .query({ nome: 'nome-que-nao-existe' })
      .set(cabecalho(dono.token));

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  test('o caractere % não funciona como curinga', async () => {
    const res = await request(app)
      .get('/api/personagens')
      .query({ nome: '%' })
      .set(cabecalho(dono.token));

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  test('filtra por raça e classe', async () => {
    const res = await request(app)
      .get('/api/personagens')
      .query({ id_raca: idRaca, id_classe: idClasse })
      .set(cabecalho(dono.token));

    expect(res.statusCode).toBe(200);
    expect(res.body.some((p) => p.id_personagem === idPersonagem)).toBe(true);
  });
});

describe('ficha', () => {
  test('devolve atributos e status calculados', async () => {
    const res = await request(app)
      .get(`/api/personagens/${idPersonagem}`)
      .set(cabecalho(dono.token));

    expect(res.statusCode).toBe(200);
    expect(res.body.nome).toBe('Heroi Teste');
    expect(res.body.nivel).toBe(3);
    expect(res.body.atributos_base.forca).toBe(16);
    expect(res.body.atributos_base.destreza).toBe(10);
    expect(res.body.atributos_finais).toBeDefined();
    expect(typeof res.body.status.hp).toBe('number');
    expect(typeof res.body.status.mana).toBe('number');
    expect(typeof res.body.status.defesa).toBe('number');
    expect(typeof res.body.status.ataque).toBe('number');
  });

  test('identificador inválido responde 400', async () => {
    const res = await request(app).get('/api/personagens/abc').set(cabecalho(dono.token));
    expect(res.statusCode).toBe(400);
  });
});

describe('isolamento entre usuários', () => {
  test('outro usuário não vê a ficha', async () => {
    const res = await request(app)
      .get(`/api/personagens/${idPersonagem}`)
      .set(cabecalho(outro.token));
    expect(res.statusCode).toBe(404);
  });

  test('outro usuário não edita', async () => {
    const res = await request(app)
      .put(`/api/personagens/${idPersonagem}`)
      .set(cabecalho(outro.token))
      .send({ nome: 'Invasor Teste' });
    expect(res.statusCode).toBe(404);
  });

  test('outro usuário não exclui', async () => {
    const res = await request(app)
      .delete(`/api/personagens/${idPersonagem}`)
      .set(cabecalho(outro.token));
    expect(res.statusCode).toBe(404);
  });

  test('a lista do outro usuário não tem o personagem', async () => {
    const res = await request(app).get('/api/personagens').set(cabecalho(outro.token));
    expect(res.statusCode).toBe(200);
    expect(res.body.some((p) => p.id_personagem === idPersonagem)).toBe(false);
  });
});

describe('edição', () => {
  test('atualiza nível e atributo', async () => {
    const res = await request(app)
      .put(`/api/personagens/${idPersonagem}`)
      .set(cabecalho(dono.token))
      .send({ nivel: 5, atributos: { forca: 18 } });
    expect(res.statusCode).toBe(200);

    const ficha = await request(app)
      .get(`/api/personagens/${idPersonagem}`)
      .set(cabecalho(dono.token));
    expect(ficha.body.nivel).toBe(5);
    expect(ficha.body.atributos_base.forca).toBe(18);
    expect(ficha.body.status.proficiencia).toBe(3);
  });

  test('recusa corpo vazio', async () => {
    const res = await request(app)
      .put(`/api/personagens/${idPersonagem}`)
      .set(cabecalho(dono.token))
      .send({});
    expect(res.statusCode).toBe(400);
  });

  test('recusa nível zero', async () => {
    const res = await request(app)
      .put(`/api/personagens/${idPersonagem}`)
      .set(cabecalho(dono.token))
      .send({ nivel: 0 });
    expect(res.statusCode).toBe(400);
    expect(res.body.campos).toContain('nivel');
  });
});

describe('exclusão', () => {
  test('exclui o personagem', async () => {
    const res = await request(app)
      .delete(`/api/personagens/${idPersonagem}`)
      .set(cabecalho(dono.token));
    expect(res.statusCode).toBe(200);
  });

  test('a ficha excluída não existe mais', async () => {
    const res = await request(app)
      .get(`/api/personagens/${idPersonagem}`)
      .set(cabecalho(dono.token));
    expect(res.statusCode).toBe(404);
  });

  test('excluir de novo responde 404', async () => {
    const res = await request(app)
      .delete(`/api/personagens/${idPersonagem}`)
      .set(cabecalho(dono.token));
    expect(res.statusCode).toBe(404);
  });
});