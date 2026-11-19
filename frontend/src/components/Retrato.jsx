import { buscarRetrato } from '../dados/retratos'

const SOMBRA = 'rgba(0, 0, 0, 0.3)'
const FRANJA = 'M31 50 Q31 27 50 27 Q69 27 69 50 Q63 37 50 37 Q37 37 31 50 Z'

function Barba({ tipo, cor }) {
  if (tipo === 'longa') {
    return (
      <path
        d="M31 54 Q30 84 50 102 Q70 84 69 54 Q62 66 50 66 Q38 66 31 54 Z"
        fill={cor}
      />
    )
  }
  if (tipo === 'curta') {
    return (
      <path
        d="M31 56 Q33 78 50 80 Q67 78 69 56 Q62 64 50 64 Q38 64 31 56 Z"
        fill={cor}
      />
    )
  }
  return null
}

function Orelhas({ tipo, cor }) {
  if (tipo === 'pontudas') {
    return (
      <>
        <path d="M31 50 L17 41 L32 62 Z" fill={cor} />
        <path d="M69 50 L83 41 L68 62 Z" fill={cor} />
      </>
    )
  }
  return (
    <>
      <ellipse cx="31" cy="54" rx="3.5" ry="6" fill={cor} />
      <ellipse cx="69" cy="54" rx="3.5" ry="6" fill={cor} />
    </>
  )
}

function Cobertura({ penteado, cabelo, roupa, detalhe }) {
  if (penteado === 'curto' || penteado === 'longo') {
    return <path d={FRANJA} fill={cabelo} />
  }

  if (penteado === 'chapeu') {
    return (
      <>
        <path d={FRANJA} fill={cabelo} />
        <path d="M30 33 Q44 24 56 3 Q60 22 70 33 Z" fill={detalhe} />
        <ellipse
          cx="50"
          cy="34"
          rx="30"
          ry="6.5"
          fill={detalhe}
          stroke={SOMBRA}
          strokeWidth="1"
        />
        <path d="M32 31.5 Q50 38 68 31.5" fill="none" stroke="#e2bb67" strokeWidth="2" />
      </>
    )
  }

  if (penteado === 'elmo') {
    return (
      <>
        <path d="M46 22 Q50 6 54 22 Z" fill="#9b2335" />
        <path
          d="M29 56 Q26 20 50 20 Q74 20 71 56 L65 56 Q65 37 50 37 Q35 37 35 56 Z"
          fill={detalhe}
          stroke={SOMBRA}
          strokeWidth="1"
        />
        <rect
          x="48.5"
          y="36"
          width="3"
          height="19"
          fill={detalhe}
          stroke={SOMBRA}
          strokeWidth="0.8"
        />
      </>
    )
  }

  if (penteado === 'capuz') {
    return (
      <path
        d="M30 58 Q28 28 50 26 Q72 28 70 58 Q67 36 50 36 Q33 36 30 58 Z"
        fill={roupa}
        stroke={SOMBRA}
        strokeWidth="1"
      />
    )
  }

  return null
}

export default function Retrato({ chave, nome }) {
  const retrato = buscarRetrato(chave)
  const acessibilidade = nome
    ? { role: 'img', 'aria-label': nome }
    : { 'aria-hidden': true }

  if (!retrato) {
    return (
      <svg className="retrato-svg" viewBox="0 0 100 120" {...acessibilidade}>
        <rect width="100" height="120" fill="#1a1612" />
        <path d="M12 120 Q16 90 50 86 Q84 90 88 120 Z" fill="#3a3128" />
        <ellipse cx="50" cy="52" rx="19" ry="23" fill="#3a3128" />
        <text x="50" y="60" textAnchor="middle" fontSize="24" fill="#6b5d48">
          ?
        </text>
      </svg>
    )
  }

  const { pele, cabelo, penteado, barba, orelhas, roupa, detalhe } = retrato

  return (
    <svg className="retrato-svg" viewBox="0 0 100 120" {...acessibilidade}>
      <rect width="100" height="120" fill="#17130f" />
      <circle cx="50" cy="52" r="46" fill="#2a2118" />

      {penteado === 'longo' && (
        <path d="M28 50 Q26 20 50 20 Q74 20 72 50 L77 92 L23 92 Z" fill={cabelo} />
      )}
      {penteado === 'capuz' && (
        <path d="M22 94 Q16 22 50 14 Q84 22 78 94 Z" fill={roupa} />
      )}

      <path d="M8 120 Q12 88 50 84 Q88 88 92 120 Z" fill={roupa} />
      <rect x="43" y="68" width="14" height="20" fill={pele} />
      <rect x="43" y="68" width="14" height="20" fill={SOMBRA} />
      <path d="M36 86 Q50 106 64 86" fill="none" stroke={detalhe} strokeWidth="2.5" />

      <Orelhas tipo={orelhas} cor={pele} />
      <ellipse cx="50" cy="52" rx="19" ry="23" fill={pele} />
      <Barba tipo={barba} cor={cabelo} />

      <path d="M38 48 Q42 45.5 46 48" fill="none" stroke={cabelo} strokeWidth="1.6" />
      <path d="M54 48 Q58 45.5 62 48" fill="none" stroke={cabelo} strokeWidth="1.6" />
      <ellipse cx="42" cy="53" rx="2.4" ry="1.7" fill="#1b1410" />
      <ellipse cx="58" cy="53" rx="2.4" ry="1.7" fill="#1b1410" />
      <path
        d="M50 54 L47.5 62 Q50 64 52.5 62"
        fill="none"
        stroke={SOMBRA}
        strokeWidth="1.2"
      />
      <path
        d="M44.5 69 Q50 72 55.5 69"
        fill="none"
        stroke="#3a1c14"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      <Cobertura penteado={penteado} cabelo={cabelo} roupa={roupa} detalhe={detalhe} />
    </svg>
  )
}