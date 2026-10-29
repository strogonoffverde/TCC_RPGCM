import { requisicao } from './api'

const PREFIXO = '/personagens'

export function listarEquipamentos(idPersonagem) {
  return requisicao(`${PREFIXO}/${idPersonagem}/equipamentos`)
}

export function equipar(idPersonagem, idEquipamento) {
  return requisicao(`${PREFIXO}/${idPersonagem}/equipamentos`, {
    metodo: 'POST',
    corpo: { id_equipamento: idEquipamento },
  })
}

export function desequipar(idPersonagem, idEquipamento) {
  return requisicao(
    `${PREFIXO}/${idPersonagem}/equipamentos/${idEquipamento}`,
    { metodo: 'DELETE' }
  )
}