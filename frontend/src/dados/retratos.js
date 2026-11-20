export const RETRATOS = [
  { chave: 'retrato-01', nome: 'Cavaleiro' },
  { chave: 'retrato-02', nome: 'Guerreira' },
  { chave: 'retrato-03', nome: 'Anão' },
  { chave: 'retrato-04', nome: 'Mago' },
  { chave: 'retrato-05', nome: 'Elfa' },
  { chave: 'retrato-06', nome: 'Ladino' },
  { chave: 'retrato-07', nome: 'Clériga' },
  { chave: 'retrato-08', nome: 'Bárbaro' },
  { chave: 'retrato-09', nome: 'Arqueiro' },
  { chave: 'retrato-10', nome: 'Feiticeira' },
  { chave: 'retrato-11', nome: 'Paladino' },
  { chave: 'retrato-12', nome: 'Druida' },
]

export function buscarRetrato(chave) {
  return RETRATOS.find((retrato) => retrato.chave === chave) || null
}

export function caminhoRetrato(chave) {
  return `${import.meta.env.BASE_URL}retratos/${chave}.jpg`
}