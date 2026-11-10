import { Link } from 'react-router-dom'
import { lerToken } from '../services/api'

const PONTOS_RPG = [
  {
    titulo: 'Jogadores',
    texto: 'Interpretam os personagens e decidem o que eles fazem a cada cena.',
  },
  {
    titulo: 'Mestre',
    texto: 'Narra a história, conduz o mundo e cuida de que as regras sejam seguidas.',
  },
  {
    titulo: 'Dados',
    texto: 'Resolvem o que é incerto, somando atributos e bônus ao resultado.',
  },
]

const RECURSOS = [
  {
    titulo: 'Fichas de personagem',
    texto: 'Crie personagens com raça, classe, nível e atributos. Edite ou exclua quando quiser.',
  },
  {
    titulo: 'Status automático',
    texto: 'HP, mana, defesa, ataque e proficiência calculados pela classe, nível, raça e equipamentos equipados.',
  },
  {
    titulo: 'Inventário',
    texto: 'Controle os itens do personagem, as quantidades e o valor total do que ele carrega.',
  },
  {
    titulo: 'Equipamentos',
    texto: 'Equipe armas, armaduras e escudos e veja os bônus refletidos na ficha.',
  },
  {
    titulo: 'Habilidades',
    texto: 'Escolha habilidades do catálogo e acompanhe o nível mínimo e o custo de mana de cada uma.',
  },
  {
    titulo: 'Catálogo pronto',
    texto: 'Raças, classes, itens e habilidades baseados no SRD do D&D 5e (2014), com itens próprios do RPGCM.',
  },
]

const PASSOS = [
  {
    titulo: 'Crie sua conta',
    texto: 'Cadastre-se com nome, e-mail e senha e entre no sistema.',
  },
  {
    titulo: 'Monte seu personagem',
    texto: 'Escolha raça, classe, nível e atributos.',
  },
  {
    titulo: 'Complete a ficha',
    texto: 'Adicione itens, equipamentos e habilidades e acompanhe o status.',
  },
]

const ATRIBUTOS_EXEMPLO = [
  { sigla: 'FOR', valor: 15, mod: '+2' },
  { sigla: 'DES', valor: 10, mod: '+0' },
  { sigla: 'CON', valor: 16, mod: '+3' },
  { sigla: 'INT', valor: 8, mod: '-1' },
  { sigla: 'SAB', valor: 12, mod: '+1' },
  { sigla: 'CAR', valor: 10, mod: '+0' },
]

function Destaque({ rotulo, valor }) {
  return (
    <div className="destaque">
      <span className="destaque-rotulo">{rotulo}</span>
      <strong className="destaque-valor">{valor}</strong>
    </div>
  )
}

function BotoesAcesso({ logado, compacto }) {
  const tamanho = compacto ? ' botao-pequeno' : ''

  if (logado) {
    return (
      <Link to="/painel" className={`botao-link botao-principal${tamanho}`}>
        Meus personagens
      </Link>
    )
  }

  return (
    <>
      <Link to="/login" className={`botao-link botao-secundario${tamanho}`}>
        Entrar
      </Link>
      <Link to="/cadastro" className={`botao-link botao-principal${tamanho}`}>
        Criar conta
      </Link>
    </>
  )
}

export default function Inicio() {
  const logado = Boolean(lerToken())

  return (
    <div className="inicio">
      <header className="inicio-nav">
        <div className="inicio-container inicio-nav-interno">
          <Link to="/" className="inicio-marca">
            RPGCM
          </Link>
          <nav className="inicio-links" aria-label="Seções da página">
            <a href="#o-que-e-rpg">O que é RPG</a>
            <a href="#sistema">Sistema</a>
            <a href="#recursos">Recursos</a>
            <a href="#como-funciona">Como funciona</a>
          </nav>
          <div className="acoes">
            <BotoesAcesso logado={logado} compacto />
          </div>
        </div>
      </header>

      <main>
        <section className="inicio-hero">
          <div className="inicio-container inicio-hero-grade">
            <div>
              <h1>
                <span className="inicio-sublinhado">Gerenciador de Personagens</span>{' '}
                de RPG
              </h1>
              <p className="inicio-lead">
                Reúna suas fichas em um só lugar: atributos, status, inventário,
                equipamentos e habilidades sempre à mão no navegador. Menos conta
                de cabeça, mais tempo de jogo.
              </p>
              <div className="inicio-chamada">
                {logado ? (
                  <Link
                    to="/painel"
                    className="botao-link botao-principal inicio-botao-grande"
                  >
                    Ir para meus personagens
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/cadastro"
                      className="botao-link botao-principal inicio-botao-grande"
                    >
                      Começar agora
                    </Link>
                    <Link
                      to="/login"
                      className="botao-link inicio-botao-contorno inicio-botao-grande"
                    >
                      Já tenho conta
                    </Link>
                  </>
                )}
              </div>
            </div>

            <aside className="inicio-mock" aria-label="Exemplo de ficha de personagem">
              <p className="inicio-mock-rotulo">Exemplo de ficha</p>
              <h3>Thorin</h3>
              <p className="subtitulo">Anão Guerreiro · Nível 5</p>
              <div className="inicio-mock-grade">
                <Destaque rotulo="HP" valor="45" />
                <Destaque rotulo="Mana" valor="5" />
                <Destaque rotulo="Defesa" valor="10" />
                <Destaque rotulo="Ataque" valor="+5" />
              </div>
              <ul className="inicio-mock-atributos">
                {ATRIBUTOS_EXEMPLO.map((atributo) => (
                  <li key={atributo.sigla}>
                    <span>{atributo.sigla}</span>
                    <strong>{atributo.valor}</strong>
                    <span className="inicio-mod">{atributo.mod}</span>
                  </li>
                ))}
              </ul>
              <p className="dica">
                Valores de exemplo. No sistema, tudo é calculado automaticamente.
              </p>
            </aside>
          </div>
        </section>

        <section id="o-que-e-rpg" className="inicio-secao inicio-secao-clara">
          <div className="inicio-container inicio-duas">
            <div className="inicio-texto">
              <h2>
                <span className="inicio-sublinhado">O que é RPG?</span>
              </h2>
              <p>
                RPG, do inglês <em>role-playing game</em>, é um jogo de
                interpretação de papéis: uma história contada em grupo. Cada
                jogador assume um personagem, decide o que ele faz e fala por
                ele, enquanto o mestre apresenta o mundo, os desafios e os
                demais personagens da aventura.
              </p>
              <p>
                Quando o resultado de uma ação é incerto, como atacar um monstro
                ou convencer um guarda, entram os dados e as regras do sistema
                escolhido. É aí que a ficha faz diferença: ela guarda tudo o que
                o jogador precisa consultar durante a partida.
              </p>
            </div>
            <div className="inicio-cartoes">
              {PONTOS_RPG.map((ponto) => (
                <article key={ponto.titulo} className="inicio-item">
                  <h3>{ponto.titulo}</h3>
                  <p>{ponto.texto}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="sistema" className="inicio-secao">
          <div className="inicio-container inicio-duas">
            <div className="inicio-texto">
              <h2>
                <span className="inicio-sublinhado">O sistema: Dungeons &amp; Dragons</span>
              </h2>
              <p>
                O RPGCM segue as regras de Dungeons &amp; Dragons (D&amp;D), um
                dos RPGs de mesa mais conhecidos do mundo. Criado nos anos 1970
                por Gary Gygax e Dave Arneson, hoje é publicado pela Wizards of
                the Coast. Usamos como base a 5ª edição (5e), lançada em 2014.
              </p>
              <p>
                Na 5e, todo personagem tem seis atributos: Força, Destreza,
                Constituição, Inteligência, Sabedoria e Carisma. A partir deles,
                da raça, da classe, do nível e do equipamento, o RPGCM calcula
                HP, mana, defesa, ataque e proficiência.
              </p>
            </div>
            <div className="inicio-cartoes">
              <article className="inicio-item">
                <h3>Do atributo ao modificador</h3>
                <p>
                  O modificador é (atributo − 10) ÷ 2, arredondado para baixo.
                  Força 15 vira +2, e Inteligência 8 vira -1. O RPGCM faz essa
                  conta sozinho.
                </p>
              </article>
              <article className="inicio-item">
                <h3>Material baseado no SRD</h3>
                <p>
                  Raças, classes, itens e habilidades vêm do SRD da 5e (2014). O
                  RPGCM adapta alguns cálculos, como a mana, e traz itens
                  próprios.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="recursos" className="inicio-secao inicio-secao-clara">
          <div className="inicio-container">
            <h2>
              <span className="inicio-sublinhado">O que você pode fazer</span>
            </h2>
            <div className="inicio-recursos">
              {RECURSOS.map((recurso) => (
                <article key={recurso.titulo} className="inicio-item">
                  <h3>{recurso.titulo}</h3>
                  <p>{recurso.texto}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="inicio-secao">
          <div className="inicio-container">
            <h2>
              <span className="inicio-sublinhado">Como funciona</span>
            </h2>
            <ol className="inicio-passos">
              {PASSOS.map((passo) => (
                <li key={passo.titulo}>
                  <h3>{passo.titulo}</h3>
                  <p>{passo.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="inicio-chamada-final">
          <div className="inicio-container">
            <h2>Pronto para criar seu primeiro personagem?</h2>
            <p>Suas fichas organizadas e o status calculado para você.</p>
            <div className="inicio-chamada">
              {logado ? (
                <Link
                  to="/painel"
                  className="botao-link botao-principal inicio-botao-grande"
                >
                  Ir para meus personagens
                </Link>
              ) : (
                <Link
                  to="/cadastro"
                  className="botao-link botao-principal inicio-botao-grande"
                >
                  Criar conta
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="inicio-rodape">
        <div className="inicio-container">
          <p>RPGCM · ArcanoStudio · Projeto de TCC</p>
          <p>
            Projeto acadêmico independente, sem afiliação com a Wizards of the
            Coast. Este trabalho inclui material do System Reference Document
            5.1 (“SRD 5.1”) da Wizards of the Coast LLC, disponível em
            dnd.wizards.com/resources/systems-reference-document e licenciado
            sob a Creative Commons Atribuição 4.0 Internacional (CC BY 4.0).
          </p>
        </div>
      </footer>
    </div>
  )
}