function formatarAtaque(valor) {
  return valor >= 0 ? `+${valor}` : String(valor)
}

function Barra({ rotulo, valor, classe }) {
  return (
    <div>
      <div className="barra-rotulo">
        <span>{rotulo}</span>
        <strong>{valor}</strong>
      </div>
      <div className="barra-trilho">
        <div className={`barra-preenchimento ${classe}`} style={{ width: '100%' }} />
      </div>
    </div>
  )
}

export default function CartaoPersonagem({ ficha }) {
  const { nome, nivel, raca, classe, status } = ficha

  return (
    <article className="cartao-personagem">
      <header>
        <h2>{nome}</h2>
        <p className="subtitulo">
          {raca.nome} {classe.nome} · Nível {nivel}
        </p>
      </header>

      <Barra rotulo="HP" valor={status.hp} classe="barra-hp" />

      {status.mana > 0 ? (
        <Barra rotulo="Mana" valor={status.mana} classe="barra-mana" />
      ) : (
        <p className="sem-mana">Sem mana</p>
      )}

      <dl className="dados">
        <div>
          <dt>Defesa</dt>
          <dd>{status.defesa}</dd>
        </div>
        <div>
          <dt>Ataque</dt>
          <dd>{formatarAtaque(status.ataque)}</dd>
        </div>
      </dl>
    </article>
  )
}