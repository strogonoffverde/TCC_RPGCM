import { requisicao } from './api'

export function listarPersonagens() {
  return requisicao('/personagens')
}

export function buscarPersonagem(id) {
  return requisicao(`/personagens/${id}`)
}