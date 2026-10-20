import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cadastrar, entrar } from '../services/api'

export default function Cadastro() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function enviar(evento) {
    evento.preventDefault()
    setErro('')

    if (senha.length < 8) {
      setErro('A senha precisa ter pelo menos 8 caracteres.')
      return
    }
    if (senha !== confirmacao) {
      setErro('As senhas não são iguais.')
      return
    }

    setCarregando(true)
    try {
      await cadastrar(nome, email, senha)
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
          <h1>Criar conta</h1>
          <p className="subtitulo">Comece a montar o seu grupo de aventureiros.</p>
        </div>

        <label>
          Nome
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoComplete="name"
            minLength={2}
            maxLength={100}
            required
          />
        </label>

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
          Senha (mínimo de 8 caracteres)
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="new-password"
            maxLength={72}
            required
          />
        </label>

        <label>
          Repita a senha
          <input
            type="password"
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            autoComplete="new-password"
            maxLength={72}
            required
          />
        </label>

        {erro && <p className="mensagem-erro" role="alert">{erro}</p>}

        <button type="submit" className="botao-principal" disabled={carregando}>
          {carregando ? 'Criando...' : 'Criar conta'}
        </button>

        <p className="rodape-auth">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </main>
  )
}