import { RETRATOS } from '../dados/retratos'
import Retrato from './Retrato'

export default function SeletorRetrato({ valor, aoMudar, desabilitado }) {
  const indice = RETRATOS.findIndex((retrato) => retrato.chave === valor)
  const atual = indice >= 0 ? RETRATOS[indice] : null

  function mover(passo) {
    const base = indice >= 0 ? indice : passo > 0 ? -1 : 0
    const proximo = (base + passo + RETRATOS.length) % RETRATOS.length
    aoMudar(RETRATOS[proximo].chave)
  }

  return (
    <fieldset className="seletor-retrato" disabled={desabilitado}>
      <legend>Retrato</legend>

      <div className="retrato-palco">
        <button
          type="button"
          className="retrato-seta"
          onClick={() => mover(-1)}
          aria-label="Retrato anterior"
        >
          ‹
        </button>
        <div className="retrato-moldura">
          <Retrato chave={valor} nome={atual ? atual.nome : 'Nenhum retrato escolhido'} />
        </div>
        <button
          type="button"
          className="retrato-seta"
          onClick={() => mover(1)}
          aria-label="Próximo retrato"
        >
          ›
        </button>
      </div>

      <p className="retrato-nome">{atual ? atual.nome : 'Escolha um retrato'}</p>

      <div className="retrato-galeria" role="group" aria-label="Galeria de retratos">
        {RETRATOS.map((retrato) => (
          <button
            key={retrato.chave}
            type="button"
            className={`retrato-miniatura${retrato.chave === valor ? ' ativa' : ''}`}
            onClick={() => aoMudar(retrato.chave)}
            aria-pressed={retrato.chave === valor}
            aria-label={retrato.nome}
          >
            <Retrato chave={retrato.chave} nome="" />
          </button>
        ))}
      </div>
    </fieldset>
  )
}