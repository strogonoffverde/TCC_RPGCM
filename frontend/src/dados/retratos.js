const TOTAL_RETRATOS = 36
const ORIGEM_API = import.meta.env.VITE_API_ORIGEM || 'http://localhost:3001'
const PADRAO_UPLOAD = /^upload-\d+-[a-f0-9]{16}$/

export const RETRATOS = Array.from({ length: TOTAL_RETRATOS }, (_, indice) => {
  const numero = String(indice + 1).padStart(2, '0')
  return { chave: `retrato-${numero}`, nome: `Retrato ${indice + 1}` }
})

export function buscarRetrato(chave) {
  return RETRATOS.find((retrato) => retrato.chave === chave) || null
}

export function ehUpload(chave) {
  return PADRAO_UPLOAD.test(chave || '')
}

export function caminhoRetrato(chave) {
  if (ehUpload(chave)) {
    return `${ORIGEM_API}/uploads/retratos/${chave}.jpg`
  }
  return `${import.meta.env.BASE_URL}retratos/${chave}.jpg`
}