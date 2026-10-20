import { useNavigate } from 'react-router-dom'
import { removerToken } from '../services/api'

export default function Painel() {
  const navigate = useNavigate()

  function sair() {
    removerToken()
    navigate('/login')
  }

  return (
    <main className="tela-auth">
      <div className="cartao">
        <div>
          <h1>Painel</h1>
          <p className="subtitulo">
            Login funcionando. Aqui vai ficar a lista de personagens.
          </p>
        </div>
        <button type="button" className="botao-secundario" onClick={sair}>
          Sair
        </button>
      </div>
    </main>
  )
}