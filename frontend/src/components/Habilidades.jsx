import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { removerToken } from '../services/api'
import {
  adicionarHabilidade,
  listarHabilidades,
  listarHabilidadesDoPersonagem,
  removerHabilidade,
} from '../services/habilidades'

function textoMana(custo) {
  return custo === 0 ? 'Sem custo de mana' : `${custo} de mana`
}

export default function Habilidades({ idPersonagem, nivelPersonagem, manaMaxima }) {
  const navigate = useNavigate()
  const [aprendidas, setAprendidas] = useState([])
  const [catalogo, setCatalogo] = useState([])
  const [idHabilidade, setIdHabilidade] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [ocupado, setOcupado] = useState(false)

  const tratarErro = useCallback(
    (e) => {
      if (e.status === 401) {
        removerToken()
        navigate('/login')
        return
      }
      setErro(e.campos ? `Confira os campos: ${e.campos.join(', ')}` : e.message)
    },
    [navigate],
  )

  useEffect(() => {
    let ativo = true

    async function carregar() {
      try {
        const [doPersonagem, doCatalogo] = await Promise.all([
          listarHabilidadesDoPersonagem(idPersonagem),
          listarHabilidades(),
        ])
        if (ativo) {
          setAprendidas(doPersonagem)
          setCatalogo(doCatalogo)
        }
      } catch (e) {
        if (ativo) tratarErro(e)
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    carregar()
    return () => {
      ativo = false
    }
  }, [idPersonagem, tratarErro])

  async function executar(acao) {
    setErro('')
    setOcupado(true)
    try {
      await acao()
      setAprendidas(await listarHabilidadesDoPersonagem(idPersonagem))
    } catch (e) {
      tratarErro(e)
    } finally {
      setOcupado(false)
    }
  }

  function adicionar(evento) {
    evento.preventDefault()
    executar(async () => {
      await adicionarHabilidade(idPersonagem, Number(idHabilidade))
      setIdHabilidade('')
    })
  }

  function remover(habilidade) {
    executar(() => removerHabilidade(idPersonagem, habilidade.id_habilidade))
  }

  const jaTem = new Set(aprendidas.map((h) => h.id_habilidade))
  const disponiveis = catalogo.filter((h) => !jaTem.has(h.id_habilidade))
  const tipos = [...new Set(disponiveis.map((h) => h.tipo))]

  return (
    <section className="cartao">
      <div className="inventario-cabecalho">
        <h2>Habilidades</h2>
        <p className="dica">
          Nível {nivelPersonagem} · Mana máxima: {manaMaxima}
        </p>
      </div>

      {carregando && <p className="subtitulo">Carregando habilidades...</p>}
      {erro && (
        <p className="mensagem-erro" role="alert">
          {erro}
        </p>
      )}
      {!carregando && aprendidas.length === 0 && (
        <p className="subtitulo">Nenhuma habilidade ainda.</p>
      )}

      {aprendidas.length > 0 && (
        <ul className="lista-inventario">
          {aprendidas.map((habilidade) => (
            <li key={habilidade.id_habilidade} className="item-inventario">
              <div className="item-info">
                <strong>{habilidade.nome}</strong>
                <span className="etiqueta">{habilidade.tipo}</span>
                {!habilidade.disponivel && (
                  <span className="etiqueta etiqueta-aviso">Nível insuficiente</span>
                )}
                <p className="dica">{habilidade.descricao}</p>
                <p className="dica">
                  Nível mínimo {habilidade.nivel_minimo} · {textoMana(habilidade.custo_mana)}
                </p>
              </div>
              <div className="item-acoes">
                <button
                  type="button"
                  className="botao-perigo botao-pequeno"
                  onClick={() => remover(habilidade)}
                  disabled={ocupado}
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="form-habilidade" onSubmit={adicionar}>
        <label>
          Habilidade
          <select
            value={idHabilidade}
            onChange={(e) => setIdHabilidade(e.target.value)}
            disabled={carregando || ocupado}
            required
          >
            <option value="">Escolha uma habilidade...</option>
            {tipos.map((tipo) => (
              <optgroup key={tipo} label={tipo}>
                {disponiveis
                  .filter((h) => h.tipo === tipo)
                  .map((h) => {
                    const bloqueada = h.nivel_minimo > nivelPersonagem
                    return (
                      <option
                        key={h.id_habilidade}
                        value={h.id_habilidade}
                        disabled={bloqueada}
                      >
                        {h.nome} (nível {h.nivel_minimo} ·{' '}
                        {h.custo_mana === 0 ? 'sem custo' : `${h.custo_mana} mana`})
                        {bloqueada ? ' — indisponível' : ''}
                      </option>
                    )
                  })}
              </optgroup>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="botao-principal"
          disabled={carregando || ocupado}
        >
          Adicionar
        </button>
      </form>
    </section>
  )
}