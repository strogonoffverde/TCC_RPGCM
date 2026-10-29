import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { removerToken } from '../services/api'
import {
  desequipar,
  equipar,
  listarEquipamentos,
} from '../services/equipamentos'

const LIMITE_EQUIPADOS = 6

const ROTULOS_ATRIBUTOS = {
  forca: 'Força',
  destreza: 'Destreza',
  constituicao: 'Constituição',
  inteligencia: 'Inteligência',
  sabedoria: 'Sabedoria',
  carisma: 'Carisma',
}

function comSinal(valor) {
  return valor >= 0 ? `+${valor}` : String(valor)
}

function rotuloTipo(tipo) {
  return tipo.charAt(0).toUpperCase() + tipo.slice(1)
}

function textoBonus(item) {
  const partes = []
  if (item.bonus_ataque > 0) partes.push(`Ataque +${item.bonus_ataque}`)
  if (item.bonus_defesa > 0) partes.push(`Defesa +${item.bonus_defesa}`)
  if (item.bonus_atributo && item.bonus_atributo_valor !== 0) {
    const nome = ROTULOS_ATRIBUTOS[item.bonus_atributo] || item.bonus_atributo
    partes.push(`${nome} ${comSinal(item.bonus_atributo_valor)}`)
  }
  return partes.length > 0 ? partes.join(' · ') : 'Sem bônus'
}

export default function Equipamentos({ idPersonagem, versao, aoAlterar }) {
  const navigate = useNavigate()
  const [equipados, setEquipados] = useState([])
  const [disponiveis, setDisponiveis] = useState([])
  const [selecionado, setSelecionado] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true

    async function carregar() {
      try {
        const dados = await listarEquipamentos(idPersonagem)
        if (ativo) {
          setEquipados(dados.equipados)
          setDisponiveis(dados.disponiveis)
        }
      } catch (e) {
        if (e.status === 401) {
          removerToken()
          navigate('/login')
          return
        }
        if (ativo) setErro(e.message)
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    carregar()
    return () => {
      ativo = false
    }
  }, [idPersonagem, versao, navigate])

  async function executar(acao) {
    setErro('')
    setOcupado(true)
    try {
      await acao()
      setSelecionado('')
      if (aoAlterar) aoAlterar()
    } catch (e) {
      if (e.status === 401) {
        removerToken()
        navigate('/login')
        return
      }
      setErro(
        e.campos ? `Confira os campos: ${e.campos.join(', ')}` : e.message
      )
    } finally {
      setOcupado(false)
    }
  }

  function aoEquipar(evento) {
    evento.preventDefault()
    if (!selecionado) return
    executar(() => equipar(idPersonagem, Number(selecionado)))
  }

  const grupos = disponiveis.reduce((mapa, item) => {
    if (!mapa[item.tipo]) mapa[item.tipo] = []
    mapa[item.tipo].push(item)
    return mapa
  }, {})

  return (
    <section className="cartao">
      <div className="inventario-cabecalho">
        <h2>Equipamentos equipados</h2>
        <span className="dica">
          {equipados.length} de {LIMITE_EQUIPADOS} equipados
        </span>
      </div>

      {carregando && <p className="subtitulo">Carregando equipamentos...</p>}
      {erro && (
        <p className="mensagem-erro" role="alert">
          {erro}
        </p>
      )}

      {!carregando && equipados.length === 0 && (
        <p className="subtitulo">Nenhum equipamento equipado.</p>
      )}

      {equipados.length > 0 && (
        <ul className="lista-inventario">
          {equipados.map((item) => (
            <li key={item.id_equipamento} className="item-inventario">
              <div className="item-info">
                <strong>{item.nome}</strong>{' '}
                <span className="etiqueta">{item.tipo}</span>
                <p className="dica">{textoBonus(item)}</p>
              </div>
              <div className="item-acoes">
                <button
                  type="button"
                  className="botao-secundario botao-pequeno"
                  onClick={() =>
                    executar(() =>
                      desequipar(idPersonagem, item.id_equipamento)
                    )
                  }
                  disabled={ocupado}
                >
                  Desequipar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!carregando && disponiveis.length === 0 ? (
        <p className="dica">
          Nenhum item equipável no inventário. Adicione armas, armaduras ou
          escudos no Inventário.
        </p>
      ) : (
        !carregando && (
          <form className="form-inventario" onSubmit={aoEquipar}>
            <div>
              <label htmlFor="equipamento-selecionado">
                Equipar item do inventário
              </label>
              <select
                id="equipamento-selecionado"
                value={selecionado}
                onChange={(e) => setSelecionado(e.target.value)}
                disabled={ocupado}
              >
                <option value="">Escolha um equipamento...</option>
                {Object.keys(grupos).map((tipo) => (
                  <optgroup key={tipo} label={rotuloTipo(tipo)}>
                    {grupos[tipo].map((item) => (
                      <option
                        key={item.id_equipamento}
                        value={item.id_equipamento}
                      >
                        {item.nome} ({textoBonus(item)})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="botao-principal"
              disabled={ocupado || !selecionado}
            >
              Equipar
            </button>
          </form>
        )
      )}
    </section>
  )
}