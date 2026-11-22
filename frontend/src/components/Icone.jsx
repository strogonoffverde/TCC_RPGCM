import { useState } from 'react'

const ARQUIVOS_ITEM = {
  arma: 'item-arma',
  armadura: 'item-armadura',
  equipamento: 'item-equipamento',
  material: 'item-material',
  pocao: 'item-pocao',
}

const ARQUIVOS_HABILIDADE = {
  ofensiva: 'magia-ofensiva',
  defensiva: 'magia-defensiva',
  suporte: 'magia-suporte',
}

function semAcento(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function escolherArquivo(categoria, tipo, nome) {
  const chave = semAcento(tipo)

  if (categoria === 'habilidade') {
    return ARQUIVOS_HABILIDADE[chave] || 'magia-generica'
  }

  if (chave === 'armadura' && semAcento(nome).includes('escudo')) {
    return 'item-escudo'
  }
  return ARQUIVOS_ITEM[chave] || 'item-generico'
}

export default function Icone({ categoria = 'item', tipo, nome }) {
  const arquivo = escolherArquivo(categoria, tipo, nome)
  const [falhou, setFalhou] = useState(null)

  if (falhou === arquivo) return null

  return (
    <img
      className="icone-img"
      src={`${import.meta.env.BASE_URL}icones/${arquivo}.jpg`}
      alt=""
      draggable={false}
      onError={() => setFalhou(arquivo)}
    />
  )
}