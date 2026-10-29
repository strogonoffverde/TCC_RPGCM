import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CartaoPersonagem from '../components/CartaoPersonagem'
import { removerToken } from '../services/api'
import {
  buscarPersonagem,
  listarClasses,
  listarPersonagens,
  listarRacas,
} from '../services/personagens'

const SEM_FILTROS = { nome: '', id_raca: '', id_classe: '' }

function Destaque({ rotulo, valor }) {
  return (
    <div className="destaque">
      <span className="destaque-rotulo">{rotulo}</span>
      <strong className="destaque-valor">{valor}</strong>
    </div>
  )
}

export default function Painel() {
  const navigate = useNavigate()
  const [fichas, setFichas] = useState([])
  const [racas, setRacas] = useState([])
  const [classes, setClasses] = useState([])
  const [nome, setNome] = useState('')
  const [idRaca, setIdRaca] = useState('')
  const [idClasse, setIdClasse] = useState('')
  const [filtros, setFiltros] = useState(SEM_FILTROS)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true

    async function carregarCatalogo() {
      try {
        const [listaRacas, listaClasses] = await Promise.all([
          listarRacas(),
          listarClasses(),
        ])
        if (ativo) {
          setRacas(listaRacas)
          setClasses(listaClasses)
        }
      } catch (e) {
        if (e.status === 401) {
          removerToken()
          navigate('/login')
          return
        }
        if (ativo) setErro(e.message)
      }
    }

    carregarCatalogo()
    return () => {
      ativo = false
    }
  }, [navigate])

  useEffect(() => {
    let ativo = true

    async function carregar() {
      try {
        const lista = await listarPersonagens(filtros)
        const detalhes = await Promise.all(
          lista.map((p) => buscarPersonagem(p.id_personagem)),
        )
        if (ativo) setFichas(detalhes)
      } catch (e) {
        if (e.status === 401) {
          removerToken()
          navigate('/login')
          return
        }
        if (ativo) {
          setErro(
            e.campos ? `Confira os campos: ${e.campos.join(', ')}` : e.message,
          )
        }
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    carregar()
    return () => {
      ativo = false
    }
  }, [navigate, filtros])

  function aplicar(evento) {
    evento.preventDefault()
    setErro('')
    setCarregando(true)
    setFiltros({ nome: nome.trim(), id_raca: idRaca, id_classe: idClasse })
  }

  function limpar() {
    setNome('')
    setIdRaca('')
    setIdClasse('')
    setErro('')
    setCarregando(true)
    setFiltros(SEM_FILTROS)
  }

  function sair() {
    removerToken()
    navigate('/login')
  }

  const temFiltro = Boolean(filtros.nome || filtros.id_raca || filtros.id_classe)
  const nivelMaisAlto = fichas.reduce((maior, f) => Math.max(maior, f.nivel), 0)
  const nivelMedio =
    fichas.length > 0
      ? Math.round((fichas.reduce((soma, f) => soma + f.nivel, 0) / fichas.length) * 10) / 10
      : 0

  return (
    <main className="painel">
      <header className="painel-topo">
        <div>
          <h1>Meus personagens</h1>
          <p className="subtitulo">Suas fichas de aventureiros.</p>
        </div>
        <div className="acoes">
          <Link to="/personagens/novo" className="botao-link botao-principal">
            Novo personagem
          </Link>
          <button type="button" className="botao-secundario" onClick={sair}>
            Sair
          </button>
        </div>
      </header>

      <form className="filtros" onSubmit={aplicar}>
        <label>
          Nome
          <input
            type="search"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={100}
            placeholder="Buscar por nome"
          />
        </label>

        <label>
          Raça
          <select value={idRaca} onChange={(e) => setIdRaca(e.target.value)}>
            <option value="">Todas</option>
            {racas.map((raca) => (
              <option key={raca.id_raca} value={raca.id_raca}>
                {raca.nome}
              </option>
            ))}
          </select>
        </label>

        <label>
          Classe
          <select value={idClasse} onChange={(e) => setIdClasse(e.target.value)}>
            <option value="">Todas</option>
            {classes.map((classe) => (
              <option key={classe.id_classe} value={classe.id_classe}>
                {classe.nome}
              </option>
            ))}
          </select>
        </label>

        <div className="acoes">
          <button type="submit" className="botao-principal" disabled={carregando}>
            Filtrar
          </button>
          <button
            type="button"
            className="botao-secundario"
            onClick={limpar}
            disabled={carregando || (!temFiltro && !nome && !idRaca && !idClasse)}
          >
            Limpar
          </button>
        </div>
      </form>

      {carregando && <p className="subtitulo">Carregando fichas...</p>}
      {erro && (
        <p className="mensagem-erro" role="alert">
          {erro}
        </p>
      )}

      {!carregando && !erro && fichas.length > 0 && (
        <section className="cartao resumo-painel">
          <h2>{temFiltro ? 'Resumo da busca' : 'Resumo'}</h2>
          <div className="status-grade">
            <Destaque rotulo="Personagens" valor={fichas.length} />
            <Destaque
              rotulo="Nível médio"
              valor={nivelMedio.toLocaleString('pt-BR')}
            />
            <Destaque rotulo="Maior nível" valor={nivelMaisAlto} />
          </div>
        </section>
      )}

      {!carregando && !erro && fichas.length === 0 && (
        <p className="subtitulo">
          {temFiltro
            ? 'Nenhum personagem encontrado com esses filtros.'
            : 'Você ainda não tem personagens.'}
        </p>
      )}

      <section className="grade-cartoes">
        {fichas.map((ficha) => (
          <CartaoPersonagem key={ficha.id_personagem} ficha={ficha} />
        ))}
      </section>
    </main>
  )
}