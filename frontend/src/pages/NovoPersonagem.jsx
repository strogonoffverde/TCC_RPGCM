import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { removerToken } from '../services/api'
import {
  criarPersonagem,
  listarClasses,
  listarRacas,
} from '../services/personagens'

const ATRIBUTOS = [
  { chave: 'forca', rotulo: 'Força' },
  { chave: 'destreza', rotulo: 'Destreza' },
  { chave: 'constituicao', rotulo: 'Constituição' },
  { chave: 'inteligencia', rotulo: 'Inteligência' },
  { chave: 'sabedoria', rotulo: 'Sabedoria' },
  { chave: 'carisma', rotulo: 'Carisma' },
]

export default function NovoPersonagem() {
  const navigate = useNavigate()
  const [racas, setRacas] = useState([])
  const [classes, setClasses] = useState([])
  const [nome, setNome] = useState('')
  const [idRaca, setIdRaca] = useState('')
  const [idClasse, setIdClasse] = useState('')
  const [nivel, setNivel] = useState('1')
  const [xp, setXp] = useState('0')
  const [descricao, setDescricao] = useState('')
  const [atributos, setAtributos] = useState({
    forca: '10',
    destreza: '10',
    constituicao: '10',
    inteligencia: '10',
    sabedoria: '10',
    carisma: '10',
  })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

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
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    carregarCatalogo()
    return () => {
      ativo = false
    }
  }, [navigate])

  function mudarAtributo(chave, valor) {
    setAtributos((atual) => ({ ...atual, [chave]: valor }))
  }

  async function enviar(evento) {
    evento.preventDefault()
    setErro('')
    setSalvando(true)

    try {
      const valoresAtributos = {}
      for (const { chave } of ATRIBUTOS) {
        valoresAtributos[chave] = Number(atributos[chave])
      }

      await criarPersonagem({
        nome,
        id_raca: Number(idRaca),
        id_classe: Number(idClasse),
        nivel: Number(nivel),
        xp: Number(xp),
        descricao: descricao.trim() === '' ? null : descricao,
        atributos: valoresAtributos,
      })
      navigate('/painel')
    } catch (e) {
      if (e.status === 401) {
        removerToken()
        navigate('/login')
        return
      }
      setErro(e.campos ? `Confira os campos: ${e.campos.join(', ')}` : e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <main className="painel">
      <form className="cartao cartao-largo formulario" onSubmit={enviar}>
        <div>
          <h1>Novo personagem</h1>
          <p className="subtitulo">Preencha os dados básicos da ficha.</p>
        </div>

        <label>
          Nome
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            minLength={2}
            maxLength={100}
            required
          />
        </label>

        <div className="linha-campos">
          <label>
            Raça
            <select
              value={idRaca}
              onChange={(e) => setIdRaca(e.target.value)}
              disabled={carregando}
              required
            >
              <option value="">Escolha...</option>
              {racas.map((raca) => (
                <option key={raca.id_raca} value={raca.id_raca}>
                  {raca.nome}
                </option>
              ))}
            </select>
          </label>

          <label>
            Classe
            <select
              value={idClasse}
              onChange={(e) => setIdClasse(e.target.value)}
              disabled={carregando}
              required
            >
              <option value="">Escolha...</option>
              {classes.map((classe) => (
                <option key={classe.id_classe} value={classe.id_classe}>
                  {classe.nome}
                </option>
              ))}
            </select>
          </label>

          <label>
            Nível (1 a 20)
            <input
              type="number"
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              min={1}
              max={20}
              step={1}
              required
            />
          </label>

          <label>
            XP
            <input
              type="number"
              value={xp}
              onChange={(e) => setXp(e.target.value)}
              min={0}
              max={1000000}
              step={1}
              required
            />
          </label>
        </div>

        <div>
          <h2>Atributos base</h2>
          <p className="dica">
            Valores de 1 a 20. Os bônus da raça são somados na ficha.
          </p>
        </div>

        <div className="linha-campos">
          {ATRIBUTOS.map(({ chave, rotulo }) => (
            <label key={chave}>
              {rotulo}
              <input
                type="number"
                value={atributos[chave]}
                onChange={(e) => mudarAtributo(chave, e.target.value)}
                min={1}
                max={20}
                step={1}
                required
              />
            </label>
          ))}
        </div>

        <label>
          Descrição (opcional)
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            maxLength={2000}
          />
        </label>

        {erro && (
          <p className="mensagem-erro" role="alert">
            {erro}
          </p>
        )}

        <div className="acoes">
          <button
            type="submit"
            className="botao-principal"
            disabled={carregando || salvando}
          >
            {salvando ? 'Salvando...' : 'Criar personagem'}
          </button>
          <Link to="/painel" className="botao-link botao-secundario">
            Cancelar
          </Link>
        </div>
      </form>
    </main>
  )
}