import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CartaoPersonagem from '../components/CartaoPersonagem'
import { removerToken } from '../services/api'
import { buscarPersonagem, listarPersonagens } from '../services/personagens'

export default function Painel() {
  const navigate = useNavigate()
  const [fichas, setFichas] = useState([])
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true

    async function carregar() {
      try {
        const lista = await listarPersonagens()
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
        if (ativo) setErro(e.message)
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    carregar()
    return () => {
      ativo = false
    }
  }, [navigate])

  function sair() {
    removerToken()
    navigate('/login')
  }

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

      {carregando && <p className="subtitulo">Carregando fichas...</p>}
      {erro && (
        <p className="mensagem-erro" role="alert">
          {erro}
        </p>
      )}
      {!carregando && !erro && fichas.length === 0 && (
        <p className="subtitulo">Você ainda não tem personagens.</p>
      )}

      <section className="grade-cartoes">
        {fichas.map((ficha) => (
          <CartaoPersonagem key={ficha.id_personagem} ficha={ficha} />
        ))}
      </section>
    </main>
  )
}