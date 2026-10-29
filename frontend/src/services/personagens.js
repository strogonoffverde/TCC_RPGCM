import { requisicao } from './api'

export function listarPersonagens(filtros = {}) {
  const parametros = new URLSearchParams()
  if (filtros.nome) parametros.set('nome', filtros.nome)
  if (filtros.id_raca) parametros.set('id_raca', filtros.id_raca)
  if (filtros.id_classe) parametros.set('id_classe', filtros.id_classe)
  const consulta = parametros.toString()
  return requisicao(consulta ? `/personagens?${consulta}` : '/personagens')
}

export function buscarPersonagem(id) {
  return requisicao(`/personagens/${id}`)
}

export function criarPersonagem(dados) {
  return requisicao('/personagens', { metodo: 'POST', corpo: dados })
}

export function atualizarPersonagem(id, dados) {
  return requisicao(`/personagens/${id}`, { metodo: 'PUT', corpo: dados })
}

export function excluirPersonagem(id) {
  return requisicao(`/personagens/${id}`, { metodo: 'DELETE' })
}

export function listarRacas() {
  return requisicao('/racas')
}

export function listarClasses() {
  return requisicao('/classes')
}