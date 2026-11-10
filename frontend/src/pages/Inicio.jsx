import { Link } from 'react-router-dom'
import { lerToken } from '../services/api'

const RECURSOS = [
  {
    titulo: 'Fichas de personagem',
    texto:
      'Crie personagens com raça, classe, nível e atributos. Edite ou exclua quando quiser.',
  },
  {
    titulo: 'Status automático',
    texto:
      'HP, mana, defesa, ataque e proficiência são calculados a partir da classe, do nível, da raça e dos equipamentos equipados.',
  },
  {
    titulo: 'Inventário',
    texto:
      'Controle os itens do personagem, as quantidades e o valor total do que ele carrega.',
  },
  {
    titulo: 'Equipamentos',
    texto:
      'Equipe armas, armaduras e escudos e veja os bônus refletidos na ficha.',
  },
  {
    titulo: 'Habilidades',
    texto:
      'Escolha habilidades do catálogo e acompanhe o nível mínimo e o custo de mana de cada uma.',
  },
  {
    titulo: 'Catálogo pronto',
    texto:
      'Raças, classes, itens e habilidades baseados no D&D 5e SRD (2014), com itens próprios do RPGCM.',
  },
]

const PASSOS = [
  'Crie sua conta e entre no sistema.',
  'Monte um personagem escolhendo raça, classe, nível e atributos.',
  'Adicione itens, equipamentos e habilidades e acompanhe tudo na ficha.',
]

export default function Inicio() {
  const logado = Boolean(lerToken())

  return (
    <main className="painel">
      <header className="cartao inicio-hero">
        <span className="etiqueta">Gerenciador de fichas de RPG</span>
        <h1>RPG Character Manager</h1>
        <p className="subtitulo">
          Reúna suas fichas de personagem em um só lugar: atributos, status,
          inventário, equipamentos e habilidades, sempre à mão no navegador.
        </p>
        <div className="acoes">
          {logado ? (
            <Link to="/painel" className="botao-link botao-principal">
              Ir para meus personagens
            </Link>
          ) : (
            <>
              <Link to="/cadastro" className="botao-link botao-principal">
                Criar conta
              </Link>
              <Link to="/login" className="botao-link botao-secundario">
                Entrar
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="inicio-secao">
        <h2>O que você pode fazer</h2>
        <div className="grade-cartoes">
          {RECURSOS.map((recurso) => (
            <article key={recurso.titulo} className="cartao">
              <h3>{recurso.titulo}</h3>
              <p className="dica">{recurso.texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cartao inicio-secao">
        <h2>Como funciona</h2>
        <ol className="inicio-passos">
          {PASSOS.map((passo) => (
            <li key={passo}>{passo}</li>
          ))}
        </ol>
      </section>

      <footer className="inicio-rodape">
        <p className="dica">RPGCM · ArcanoStudio · Projeto de TCC</p>
      </footer>
    </main>
  )
}