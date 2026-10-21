import { requisicao } from './api'

export function listarPersonagens() {
  return requisicao('/personagens')
}

export function buscarPersonagem(id) {
  return requisicao(`/personagens/${id}`)
}

export function criarPersonagem(dados) {
  return requisicao('/personagens', { metodo: 'POST', corpo: dados })
}

export function listarRacas() {
  return requisicao('/racas')
}

export function listarClasses() {
  return requisicao('/classes')
}