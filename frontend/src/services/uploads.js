import { requisicao } from './api'

export function enviarRetrato(imagem) {
  return requisicao('/uploads/retrato', { metodo: 'POST', corpo: { imagem } })
}