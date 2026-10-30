const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

const EMAIL = `teste.auto.auth.${Date.now()}@exemplo.com`;
const SENHA = 'SenhaTeste123';
const SENHA_NOVA = 'OutraSenha456';

let token;

function entrar(email, senha) {
  return request(app).post('/api/auth/login').send({ email, senha });
}

afterAll(async () => {
  await pool.query('DELETE FROM usuario WHERE email = ?', [EMAIL]);
  await pool.end();
});

describe('cadastro', () => {
  test('cria um usuário novo', async () => {
    const res = await request(app)
      .post('/api/auth/cadastro')
      .send({ nome: 'Teste Automatico', email: EMAIL, senha: SENHA });

    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe(EMAIL);
  });

  test('recusa e-mail repetido', async () => {
    const res = await request(app)
      .post('/api/auth/cadastro')
      .send({ nome: 'Teste Automatico', email: EMAIL, senha: SENHA });

    expect(res.statusCode).toBe(409);
  });

  test('recusa dados inválidos e informa os campos', async () => {
    const res = await request(app)
      .post('/api/auth/cadastro')
      .send({ nome: 'Teste', email: 'isto-nao-e-email', senha: '123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.campos).toEqual(expect.arrayContaining(['email', 'senha']));
  });
});

describe('login', () => {
  test('entra com e-mail e senha corretos', async () => {
    const res = await entrar(EMAIL, SENHA);

    expect(res.statusCode).toBe(200);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.usuario.email).toBe(EMAIL);
    token = res.body.token;
  });

  test('recusa senha errada', async () => {
    const res = await entrar(EMAIL, 'senha-errada-123');
    expect(res.statusCode).toBe(401);
  });

  test('recusa e-mail que não existe', async () => {
    const res = await entrar('ninguem.existe@exemplo.com', SENHA);
    expect(res.statusCode).toBe(401);
  });
});

describe('rota protegida (perfil)', () => {
  test('sem token responde 401', async () => {
    const res = await request(app).get('/api/usuarios/perfil');
    expect(res.statusCode).toBe(401);
  });

  test('com token inválido responde 401', async () => {
    const res = await request(app)
      .get('/api/usuarios/perfil')
      .set('Authorization', 'Bearer token.invalido.aqui');
    expect(res.statusCode).toBe(401);
  });

  test('com token válido devolve o perfil sem a senha', async () => {
    const res = await request(app)
      .get('/api/usuarios/perfil')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(EMAIL);
    expect(res.body.senha).toBeUndefined();
  });
});

describe('edição do perfil', () => {
  test('atualiza o nome', async () => {
    const res = await request(app)
      .put('/api/usuarios/perfil')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Nome Alterado' });
    expect(res.statusCode).toBe(200);

    const perfil = await request(app)
      .get('/api/usuarios/perfil')
      .set('Authorization', `Bearer ${token}`);
    expect(perfil.body.nome).toBe('Nome Alterado');
  });

  test('recusa a troca de senha com a senha atual errada', async () => {
    const res = await request(app)
      .put('/api/usuarios/senha')
      .set('Authorization', `Bearer ${token}`)
      .send({ senha_atual: 'senha-errada-123', senha_nova: SENHA_NOVA });
    expect(res.statusCode).toBe(400);

    const login = await entrar(EMAIL, SENHA);
    expect(login.statusCode).toBe(200);
  });

  test('troca a senha com a senha atual correta', async () => {
    const res = await request(app)
      .put('/api/usuarios/senha')
      .set('Authorization', `Bearer ${token}`)
      .send({ senha_atual: SENHA, senha_nova: SENHA_NOVA });
    expect(res.statusCode).toBe(200);

    const antiga = await entrar(EMAIL, SENHA);
    expect(antiga.statusCode).toBe(401);

    const nova = await entrar(EMAIL, SENHA_NOVA);
    expect(nova.statusCode).toBe(200);
  });
});

describe('logout', () => {
  test('exige token', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.statusCode).toBe(401);
  });

  test('responde 200 com token válido', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});