import { requisicao } from './api'

export function listarHabilidades() {
  return requisicao('/habilidades')
}

export function listarHabilidadesDoPersonagem(idPersonagem) {
  return requisicao(`/personagens/${idPersonagem}/habilidades`)
}

export function adicionarHabilidade(idPersonagem, idHabilidade) {
  return requisicao(`/personagens/${idPersonagem}/habilidades`, {
    metodo: 'POST',
    corpo: { id_habilidade: idHabilidade },
  })
}

export function removerHabilidade(idPersonagem, idHabilidade) {
  return requisicao(`/personagens/${idPersonagem}/habilidades/${idHabilidade}`, {
    metodo: 'DELETE',
  })
}