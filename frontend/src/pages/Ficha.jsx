import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Equipamentos from '../components/Equipamentos'
import Habilidades from '../components/Habilidades'
import Inventario from '../components/Inventario'
import { removerToken } from '../services/api'
import { buscarPersonagem, excluirPersonagem } from '../services/personagens'

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

function Destaque({ rotulo, valor }) {
  return (
    <div className="destaque">
      <span className="destaque-rotulo">{rotulo}</span>
      <strong className="destaque-valor">{valor}</strong>
    </div>
  )
}

export default function Ficha() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ficha, setFicha] = useState(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [confirmando, setConfirmando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    let ativo = true

    async function carregar() {
      try {
        const dados = await buscarPersonagem(id)
        if (ativo) setFicha(dados)
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
  }, [id, navigate, versao])

  function atualizar() {
    setVersao((atual) => atual + 1)
  }

  async function excluir() {
    setErro('')
    setExcluindo(true)
    try {
      await excluirPersonagem(id)
      navigate('/painel')
    } catch (e) {
      if (e.status === 401) {
        removerToken()
        navigate('/login')
        return
      }
      setErro(e.message)
      setConfirmando(false)
      setExcluindo(false)
    }
  }

  return (
    <main className="painel">
      <div className="ficha-topo">
        <Link to="/painel" className="botao-link botao-secundario">
          Voltar
        </Link>

        {ficha && (
          <div className="acoes">
            <Link
              to={`/personagens/${id}/editar`}
              className="botao-link botao-secundario"
            >
              Editar
            </Link>
            <button
              type="button"
              className="botao-perigo"
              onClick={() => setConfirmando(true)}
              disabled={confirmando}
            >
              Excluir
            </button>
          </div>
        )}
      </div>

      {carregando && <p className="subtitulo">Carregando ficha...</p>}
      {erro && (
        <p className="mensagem-erro" role="alert">
          {erro}
        </p>
      )}

      {confirmando && ficha && (
        <div className="confirmacao" role="alertdialog">
          <p>
            Excluir <strong>{ficha.nome}</strong>? Isso apaga também os
            atributos, o inventário, as habilidades e os equipamentos dele.
            Não dá para desfazer.
          </p>
          <div className="acoes">
            <button
              type="button"
              className="botao-principal"
              onClick={excluir}
              disabled={excluindo}
            >
              {excluindo ? 'Excluindo...' : 'Sim, excluir'}
            </button>
            <button
              type="button"
              className="botao-secundario"
              onClick={() => setConfirmando(false)}
              disabled={excluindo}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {ficha && (
        <article className="ficha">
          <header className="cartao">
            <h1>{ficha.nome}</h1>
            <p className="subtitulo">
              {ficha.raca.nome} {ficha.classe.nome} · Nível {ficha.nivel} ·{' '}
              {ficha.xp} XP
            </p>
            {ficha.descricao && (
              <p className="ficha-descricao">{ficha.descricao}</p>
            )}
          </header>

          <section className="cartao">
            <h2>Status</h2>
            <div className="status-grade">
              <Destaque rotulo="HP" valor={ficha.status.hp} />
              <Destaque rotulo="Mana" valor={ficha.status.mana} />
              <Destaque rotulo="Defesa" valor={ficha.status.defesa} />
              <Destaque rotulo="Ataque" valor={comSinal(ficha.status.ataque)} />
              <Destaque
                rotulo="Proficiência"
                valor={comSinal(ficha.status.proficiencia)}
              />
            </div>
          </section>

          <section className="cartao">
            <h2>Atributos</h2>
            <div className="tabela-rolavel">
              <table className="tabela-atributos">
                <thead>
                  <tr>
                    <th>Atributo</th>
                    <th>Base</th>
                    <th>Final</th>
                    <th>Modificador</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(ROTULOS_ATRIBUTOS).map((chave) => (
                    <tr key={chave}>
                      <td>{ROTULOS_ATRIBUTOS[chave]}</td>
                      <td>{ficha.atributos_base[chave]}</td>
                      <td>{ficha.atributos_finais[chave]}</td>
                      <td>{comSinal(ficha.status.modificadores[chave])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="dica">
              Final = base + bônus da raça + bônus dos equipamentos equipados.
            </p>
          </section>

          <Equipamentos
            idPersonagem={id}
            versao={versao}
            aoAlterar={atualizar}
          />

          <Habilidades
            idPersonagem={id}
            nivelPersonagem={ficha.nivel}
            manaMaxima={ficha.status.mana}
          />
          <Inventario idPersonagem={id} aoAlterar={atualizar} />
        </article>
      )}
    </main>
  )
}