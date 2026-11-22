import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ehUpload, RETRATOS } from '../dados/retratos'
import { removerToken } from '../services/api'
import { enviarRetrato } from '../services/uploads'
import Retrato from './Retrato'

const LIMITE_ARQUIVO = 8 * 1024 * 1024
const TIPOS_ACEITOS = ['image/png', 'image/jpeg', 'image/webp']
const LADO = 400

function reduzirImagem(arquivo) {
  return new Promise((resolve, reject) => {
    const endereco = URL.createObjectURL(arquivo)
    const imagem = new Image()

    imagem.onload = () => {
      URL.revokeObjectURL(endereco)
      const lado = Math.min(imagem.width, imagem.height)
      const x = (imagem.width - lado) / 2
      const y = (imagem.height - lado) / 4
      const tela = document.createElement('canvas')
      tela.width = LADO
      tela.height = LADO
      tela.getContext('2d').drawImage(imagem, x, y, lado, lado, 0, 0, LADO, LADO)
      resolve(tela.toDataURL('image/jpeg', 0.85))
    }

    imagem.onerror = () => {
      URL.revokeObjectURL(endereco)
      reject(new Error('Não foi possível ler essa imagem'))
    }

    imagem.src = endereco
  })
}

export default function SeletorRetrato({ valor, aoMudar, desabilitado }) {
  const navigate = useNavigate()
  const campoArquivo = useRef(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const indice = RETRATOS.findIndex((retrato) => retrato.chave === valor)
  const atual = indice >= 0 ? RETRATOS[indice] : null
  const enviada = ehUpload(valor)

  function mover(passo) {
    const base = indice >= 0 ? indice : passo > 0 ? -1 : 0
    const proximo = (base + passo + RETRATOS.length) % RETRATOS.length
    aoMudar(RETRATOS[proximo].chave)
  }

  async function aoEscolherArquivo(evento) {
    const arquivo = evento.target.files[0]
    evento.target.value = ''
    if (!arquivo) return

    setErro('')
    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      setErro('Envie uma imagem PNG, JPG ou WEBP')
      return
    }
    if (arquivo.size > LIMITE_ARQUIVO) {
      setErro('A imagem é muito grande (máximo de 8 MB)')
      return
    }

    setEnviando(true)
    try {
      const reduzida = await reduzirImagem(arquivo)
      const resposta = await enviarRetrato(reduzida)
      aoMudar(resposta.retrato)
    } catch (e) {
      if (e.status === 401) {
        removerToken()
        navigate('/login')
        return
      }
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  const nomeAtual = enviada ? 'Sua imagem' : atual ? atual.nome : 'Escolha um retrato'

  return (
    <fieldset className="seletor-retrato" disabled={desabilitado}>
      <legend>Retrato</legend>

      <div className="retrato-palco">
        <button
          type="button"
          className="retrato-seta"
          onClick={() => mover(-1)}
          aria-label="Retrato anterior"
        >
          ‹
        </button>
        <div className="retrato-moldura">
          <Retrato chave={valor} nome={nomeAtual} />
        </div>
        <button
          type="button"
          className="retrato-seta"
          onClick={() => mover(1)}
          aria-label="Próximo retrato"
        >
          ›
        </button>
      </div>

      <p className="retrato-nome">{nomeAtual}</p>

      <div className="retrato-galeria" role="group" aria-label="Galeria de retratos">
        {RETRATOS.map((retrato) => (
          <button
            key={retrato.chave}
            type="button"
            className={`retrato-miniatura${retrato.chave === valor ? ' ativa' : ''}`}
            onClick={() => aoMudar(retrato.chave)}
            aria-pressed={retrato.chave === valor}
            aria-label={retrato.nome}
          >
            <Retrato chave={retrato.chave} nome="" />
          </button>
        ))}
      </div>

      <div className="retrato-envio">
        <input
          ref={campoArquivo}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={aoEscolherArquivo}
          hidden
        />
        <button
          type="button"
          className="botao-secundario botao-pequeno"
          onClick={() => campoArquivo.current.click()}
          disabled={enviando}
        >
          {enviando ? 'Enviando...' : 'Enviar minha imagem'}
        </button>
        <span className="dica">PNG, JPG ou WEBP até 8 MB. A imagem é recortada em quadrado.</span>
      </div>

      {erro && (
        <p className="mensagem-erro" role="alert">
          {erro}
        </p>
      )}
    </fieldset>
  )
}