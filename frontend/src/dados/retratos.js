export const RETRATOS = [
  { chave: 'retrato-01', nome: 'Cavaleiro', pele: '#e3b894', cabelo: '#3b2a1e', penteado: 'elmo', barba: 'nenhuma', orelhas: 'normais', roupa: '#5b6168', detalhe: '#b8bcc2' },
  { chave: 'retrato-02', nome: 'Guerreira', pele: '#c98d62', cabelo: '#7a2e1f', penteado: 'longo', barba: 'nenhuma', orelhas: 'normais', roupa: '#8a2f26', detalhe: '#c9a24a' },
  { chave: 'retrato-03', nome: 'Anão', pele: '#d9a47e', cabelo: '#8a4b22', penteado: 'elmo', barba: 'longa', orelhas: 'normais', roupa: '#4a3a2c', detalhe: '#9aa0a6' },
  { chave: 'retrato-04', nome: 'Mago', pele: '#e8c4a0', cabelo: '#cfcfcf', penteado: 'chapeu', barba: 'longa', orelhas: 'normais', roupa: '#2f4a7a', detalhe: '#2f4a7a' },
  { chave: 'retrato-05', nome: 'Elfa', pele: '#f0d0b0', cabelo: '#e9d9a0', penteado: 'longo', barba: 'nenhuma', orelhas: 'pontudas', roupa: '#2f6b5a', detalhe: '#c9a24a' },
  { chave: 'retrato-06', nome: 'Ladino', pele: '#b98a66', cabelo: '#222222', penteado: 'capuz', barba: 'curta', orelhas: 'normais', roupa: '#33363c', detalhe: '#7d6530' },
  { chave: 'retrato-07', nome: 'Clériga', pele: '#8d5a3b', cabelo: '#1c1410', penteado: 'longo', barba: 'nenhuma', orelhas: 'normais', roupa: '#d8d2c0', detalhe: '#c9a24a' },
  { chave: 'retrato-08', nome: 'Bárbaro', pele: '#d6a07a', cabelo: '#b0702c', penteado: 'longo', barba: 'curta', orelhas: 'normais', roupa: '#6b4a2a', detalhe: '#3b2a1e' },
  { chave: 'retrato-09', nome: 'Arqueiro', pele: '#e6c8a6', cabelo: '#3a2a1c', penteado: 'capuz', barba: 'nenhuma', orelhas: 'pontudas', roupa: '#355e3b', detalhe: '#7d6530' },
  { chave: 'retrato-10', nome: 'Feiticeira', pele: '#e0b79a', cabelo: '#6a2f6f', penteado: 'longo', barba: 'nenhuma', orelhas: 'normais', roupa: '#5a2a6a', detalhe: '#e2bb67' },
  { chave: 'retrato-11', nome: 'Paladino', pele: '#c89870', cabelo: '#222222', penteado: 'careca', barba: 'curta', orelhas: 'normais', roupa: '#b8962e', detalhe: '#efe6d2' },
  { chave: 'retrato-12', nome: 'Druida', pele: '#b98c66', cabelo: '#8a8a7a', penteado: 'capuz', barba: 'longa', orelhas: 'normais', roupa: '#4d6b3c', detalhe: '#7d6530' },
]

export function buscarRetrato(chave) {
  return RETRATOS.find((retrato) => retrato.chave === chave) || null
}