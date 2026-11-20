const TOTAL_RETRATOS = 36

export const RETRATOS = Array.from({ length: TOTAL_RETRATOS }, (_, indice) => {
  const numero = String(indice + 1).padStart(2, '0')
  return { chave: `retrato-${numero}`, nome: `Retrato ${indice + 1}` }
})

export function buscarRetrato(chave) {
  return RETRATOS.find((retrato) => retrato.chave === chave) || null
}

export function caminhoRetrato(chave) {
  return `${import.meta.env.BASE_URL}retratos/${chave}.jpg`
}