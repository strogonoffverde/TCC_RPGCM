import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { removerToken } from '../services/api'
import {
  adicionarAoInventario,
  alterarQuantidade,
  listarInventario,
  listarItens,
  removerDoInventario,
} from '../services/inventario'

const LIMITE_QUANTIDADE = 999

export default function Inventario({ idPersonagem, aoAlterar }) {
  const navigate = useNavigate()
  const [inventario, setInventario] = useState([])
  const [catalogo, setCatalogo] = useState([])
  const [idItem, setIdItem] = useState('')
  const [quantidade, setQuantidade] = useState('1')
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
        const [itensInventario, itensCatalogo] = await Promise.all([
          listarInventario(idPersonagem),
          listarItens(),
        ])
        if (ativo) {
          setInventario(itensInventario)
          setCatalogo(itensCatalogo)
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
      setInventario(await listarInventario(idPersonagem))
      if (aoAlterar) aoAlterar()
    } catch (e) {
      tratarErro(e)
    } finally {
      setOcupado(false)
    }
  }

  function adicionar(evento) {
    evento.preventDefault()
    executar(async () => {
      await adicionarAoInventario(idPersonagem, Number(idItem), Number(quantidade))
      setIdItem('')
      setQuantidade('1')
    })
  }

  function mudarQuantidade(item, diferenca) {
    const nova = Math.min(LIMITE_QUANTIDADE, Math.max(1, item.quantidade + diferenca))
    if (nova === item.quantidade) return
    executar(() => alterarQuantidade(idPersonagem, item.id_item, nova))
  }

  function remover(item) {
    executar(() => removerDoInventario(idPersonagem, item.id_item))
  }

  const tipos = [...new Set(catalogo.map((item) => item.tipo))]

  const valorTotal =
    Math.round(
      inventario.reduce((soma, item) => soma + item.valor * item.quantidade, 0) * 100,
    ) / 100

  return (
    <section className="cartao">
      <div className="inventario-cabecalho">
        <h2>Inventário</h2>
        <p className="dica">Valor total: {valorTotal.toLocaleString('pt-BR')} po</p>
      </div>

      {carregando && <p className="subtitulo">Carregando inventário...</p>}
      {erro && (
        <p className="mensagem-erro" role="alert">
          {erro}
        </p>
      )}
      {!carregando && inventario.length === 0 && (
        <p className="subtitulo">Inventário vazio.</p>
      )}

      {inventario.length > 0 && (
        <ul className="lista-inventario">
          {inventario.map((item) => (
            <li key={item.id_item} className="item-inventario">
              <div className="item-info">
                <strong>{item.nome}</strong>
                <span className="etiqueta">{item.tipo}</span>
                <p className="dica">
                  {item.descricao} ({item.valor.toLocaleString('pt-BR')} po cada)
                </p>
              </div>
              <div className="item-acoes">
                <button
                  type="button"
                  className="botao-secundario botao-pequeno"
                  onClick={() => mudarQuantidade(item, -1)}
                  disabled={ocupado || item.quantidade <= 1}
                  aria-label={`Diminuir a quantidade de ${item.nome}`}
                >
                  −
                </button>
                <span className="quantidade">{item.quantidade}</span>
                <button
                  type="button"
                  className="botao-secundario botao-pequeno"
                  onClick={() => mudarQuantidade(item, 1)}
                  disabled={ocupado || item.quantidade >= LIMITE_QUANTIDADE}
                  aria-label={`Aumentar a quantidade de ${item.nome}`}
                >
                  +
                </button>
                <button
                  type="button"
                  className="botao-perigo botao-pequeno"
                  onClick={() => remover(item)}
                  disabled={ocupado}
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="form-inventario" onSubmit={adicionar}>
        <label>
          Item
          <select
            value={idItem}
            onChange={(e) => setIdItem(e.target.value)}
            disabled={carregando || ocupado}
            required
          >
            <option value="">Escolha um item...</option>
            {tipos.map((tipo) => (
              <optgroup key={tipo} label={tipo}>
                {catalogo
                  .filter((item) => item.tipo === tipo)
                  .map((item) => (
                    <option key={item.id_item} value={item.id_item}>
                      {item.nome} ({item.valor.toLocaleString('pt-BR')} po)
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>

        <label>
          Quantidade
          <input
            type="number"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            min={1}
            max={LIMITE_QUANTIDADE}
            step={1}
            required
          />
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