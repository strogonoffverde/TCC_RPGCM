const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const CHAVE_TOKEN = 'rpgcm_token'

export function guardarToken(token) {
  sessionStorage.setItem(CHAVE_TOKEN, token)
}

export function lerToken() {
  return sessionStorage.getItem(CHAVE_TOKEN)
}

export function removerToken() {
  sessionStorage.removeItem(CHAVE_TOKEN)
}

export async function requisicao(caminho, { metodo = 'GET', corpo } = {}) {
  const cabecalhos = {}
  const token = lerToken()

  if (corpo !== undefined) {
    cabecalhos['Content-Type'] = 'application/json'
  }
  if (token) {
    cabecalhos.Authorization = `Bearer ${token}`
  }

  let resposta
  try {
    resposta = await fetch(`${BASE_URL}${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    })
  } catch {
    throw new Error('Não foi possível falar com o servidor. Ele está ligado?')
  }

  let dados = null
  try {
    dados = await resposta.json()
  } catch {
    dados = null
  }

  if (!resposta.ok) {
    const erro = new Error((dados && dados.erro) || 'Algo deu errado')
    erro.status = resposta.status
    erro.campos = dados && dados.campos
    throw erro
  }

  return dados
}

export async function entrar(email, senha) {
  const dados = await requisicao('/auth/login', {
    metodo: 'POST',
    corpo: { email, senha },
  })
  guardarToken(dados.token)
  return dados.usuario
}

export async function cadastrar(nome, email, senha) {
  return requisicao('/auth/cadastro', {
    metodo: 'POST',
    corpo: { nome, email, senha },
  })
}