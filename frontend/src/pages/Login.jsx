import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { entrar } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function enviar(evento) {
    evento.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      await entrar(email, senha)
      navigate('/painel')
    } catch (e) {
      setErro(e.campos ? `Confira os campos: ${e.campos.join(', ')}` : e.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="tela-auth">
      <form className="cartao" onSubmit={enviar}>
        <div>
          <h1>RPG Character Manager</h1>
          <p className="subtitulo">Entre para ver as suas fichas.</p>
        </div>

        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            maxLength={100}
            required
          />
        </label>

        <label>
          Senha
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            maxLength={72}
            required
          />
        </label>

        {erro && <p className="mensagem-erro" role="alert">{erro}</p>}

        <button type="submit" className="botao-principal" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="rodape-auth">
          Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
      </form>
    </main>
  )
}