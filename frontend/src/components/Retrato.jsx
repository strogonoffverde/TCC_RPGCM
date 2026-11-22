import { useState } from 'react'
import { buscarRetrato, caminhoRetrato, ehUpload } from '../dados/retratos'

function Silhueta({ acessibilidade }) {
  return (
    <svg className="retrato-svg" viewBox="0 0 100 150" {...acessibilidade}>
      <rect width="100" height="150" fill="#1a1612" />
      <path d="M10 150 Q14 112 50 106 Q86 112 90 150 Z" fill="#3a3128" />
      <ellipse cx="50" cy="64" rx="21" ry="25" fill="#3a3128" />
      <text x="50" y="74" textAnchor="middle" fontSize="26" fill="#6b5d48">
        ?
      </text>
    </svg>
  )
}

export default function Retrato({ chave, nome }) {
  const [chaveComFalha, setChaveComFalha] = useState(null)
  const valido = Boolean(buscarRetrato(chave)) || ehUpload(chave)
  const acessibilidade = nome
    ? { role: 'img', 'aria-label': nome }
    : { 'aria-hidden': true }

  if (!valido || chaveComFalha === chave) {
    return <Silhueta acessibilidade={acessibilidade} />
  }

  return (
    <img
      className="retrato-img"
      src={caminhoRetrato(chave)}
      alt={nome || ''}
      draggable={false}
      onError={() => setChaveComFalha(chave)}
    />
  )
}