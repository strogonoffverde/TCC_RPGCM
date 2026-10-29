import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { removerToken } from '../services/api'
import { alterarSenha, atualizarPerfil, buscarPerfil } from '../services/perfil'

export default function Perfil() {
  const navigate = useNavigate()
  const [perfil, setPerfil] = useState(null)
  const [nome, setNome] = useState('')
  const [senhaAtual, setSenhaAtual] = useState('')
  const [senhaNova, setSenhaNova] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [erroSenha, setErroSenha] = useState('')
  const [sucessoSenha, setSucessoSenha] = useState('')

  useEffect(() => {
    let ativo = true

    async function carregar() {
      try {
        const dados = await buscarPerfil()
        if (ativo) {
          setPerfil(dados)
          setNome(dados.nome)
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
  }, [navigate])

  function tratarErro(e, definir) {
    if (e.status === 401) {
      removerToken()
      navigate('/login')
      return
    }
    definir(e.campos ? `Confira os campos: ${e.campos.join(', ')}` : e.message)
  }

  async function salvarNome(evento) {
    evento.preventDefault()
    setErro('')
    setSucesso('')
    setOcupado(true)
    try {
      const nomeLimpo = nome.trim()
      await atualizarPerfil(nomeLimpo)
      setPerfil({ ...perfil, nome: nomeLimpo })
      setNome(nomeLimpo)
      setSucesso('Nome atualizado.')
    } catch (e) {
      tratarErro(e, setErro)
    } finally {
      setOcupado(false)
    }
  }

  async function salvarSenha(evento) {
    evento.preventDefault()
    setErroSenha('')
    setSucessoSenha('')

    if (senhaNova.length < 8) {
      setErroSenha('A nova senha precisa ter pelo menos 8 caracteres.')
      return
    }
    if (senhaNova !== confirmacao) {
      setErroSenha('As senhas novas não são iguais.')
      return
    }

    setOcupado(true)
    try {
      await alterarSenha(senhaAtual, senhaNova)
      setSenhaAtual('')
      setSenhaNova('')
      setConfirmacao('')
      setSucessoSenha('Senha alterada.')
    } catch (e) {
      tratarErro(e, setErroSenha)
    } finally {
      setOcupado(false)
    }
  }

  return (
    <main className="painel">
      <div className="ficha-topo">
        <Link to="/painel" className="botao-link botao-secundario">
          Voltar
        </Link>
      </div>

      <h1>Meu perfil</h1>
      {carregando && <p className="subtitulo">Carregando perfil...</p>}

      {perfil && (
        <article className="ficha">
          <section className="cartao">
            <h2>Dados da conta</h2>
            <p className="dica">
              Conta criada em{' '}
              {new Date(perfil.data_cadastro).toLocaleDateString('pt-BR')}.
            </p>

            <form className="form-perfil" onSubmit={salvarNome}>
              <label>
                E-mail
                <input type="email" value={perfil.email} disabled />
              </label>

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

              {erro && (
                <p className="mensagem-erro" role="alert">
                  {erro}
                </p>
              )}
              {sucesso && <p className="mensagem-ok">{sucesso}</p>}

              <div className="acoes">
                <button
                  type="submit"
                  className="botao-principal"
                  disabled={ocupado || nome.trim() === perfil.nome}
                >
                  Salvar nome
                </button>
              </div>
            </form>
          </section>

          <section className="cartao">
            <h2>Alterar senha</h2>

            <form className="form-perfil" onSubmit={salvarSenha}>
              <label>
                Senha atual
                <input
                  type="password"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  autoComplete="current-password"
                  maxLength={72}
                  required
                />
              </label>

              <label>
                Nova senha (mínimo de 8 caracteres)
                <input
                  type="password"
                  value={senhaNova}
                  onChange={(e) => setSenhaNova(e.target.value)}
                  autoComplete="new-password"
                  maxLength={72}
                  required
                />
              </label>

              <label>
                Repita a nova senha
                <input
                  type="password"
                  value={confirmacao}
                  onChange={(e) => setConfirmacao(e.target.value)}
                  autoComplete="new-password"
                  maxLength={72}
                  required
                />
              </label>

              {erroSenha && (
                <p className="mensagem-erro" role="alert">
                  {erroSenha}
                </p>
              )}
              {sucessoSenha && <p className="mensagem-ok">{sucessoSenha}</p>}

              <div className="acoes">
                <button type="submit" className="botao-principal" disabled={ocupado}>
                  Alterar senha
                </button>
              </div>
            </form>
          </section>
        </article>
      )}
    </main>
  )
}