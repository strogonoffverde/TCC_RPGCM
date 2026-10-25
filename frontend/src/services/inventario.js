import { requisicao } from './api'

export function listarItens() {
  return requisicao('/itens')
}

export function listarInventario(idPersonagem) {
  return requisicao(`/personagens/${idPersonagem}/inventario`)
}

export function adicionarAoInventario(idPersonagem, idItem, quantidade) {
  return requisicao(`/personagens/${idPersonagem}/inventario`, {
    metodo: 'POST',
    corpo: { id_item: idItem, quantidade },
  })
}

export function alterarQuantidade(idPersonagem, idItem, quantidade) {
  return requisicao(`/personagens/${idPersonagem}/inventario/${idItem}`, {
    metodo: 'PUT',
    corpo: { quantidade },
  })
}

export function removerDoInventario(idPersonagem, idItem) {
  return requisicao(`/personagens/${idPersonagem}/inventario/${idItem}`, {
    metodo: 'DELETE',
  })
}