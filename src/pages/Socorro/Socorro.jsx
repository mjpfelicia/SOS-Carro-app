import { useEffect, useMemo, useState } from "react"
import HomeBackButton from "../../components/HomeBackButton"
import PrimaryActionButton from "../../components/PrimaryActionButton"
import WhatsAppButton from "../../components/WhatsAppButton"
import { createChamado } from "../../services/chamadosService"
import { listPrestadores } from "../../services/prestadoresService"
import {
  getAssinaturaAtual,
  listPacotes,
  podeUsarChamado,
  registrarUsoChamado
} from "../../services/assinaturasService"
import "./Socorro.css"

const OPCOES_SOCORRO = [
  {
    id: "pane-total",
    icone: "SOS",
    titulo: "Pane total",
    tipo: "Guincho",
    descricao: "Reboque para carro parado ou pane mais grave.",
    prioridade: "alta",
    ordem: 1
  },
  {
    id: "nao-liga",
    icone: "BAT",
    titulo: "Nao liga",
    tipo: "Bateria",
    descricao: "AuxÃ­lio para bateria, carga ou partida emergencial.",
    prioridade: "alta",
    ordem: 2
  },
  {
    id: "pneu-furado",
    icone: "PNEU",
    titulo: "Pneu furado",
    tipo: "Borracheiro",
    descricao: "Troca de pneu, estepe ou atendimento rÃ¡pido na pista.",
    prioridade: "media",
    ordem: 3
  },
  {
    id: "preciso-mecanico",
    icone: "MEC",
    titulo: "Preciso de mecanico",
    tipo: "Mecanico",
    descricao: "Falha no motor, barulhos estranhos ou defeito mecÃ¢nico.",
    prioridade: "media",
    ordem: 4
  },
  {
    id: "superaquecimento",
    icone: "TEMP",
    titulo: "Superaquecimento",
    tipo: "Mecanico",
    descricao: "Motor esquentando, vapor no capÃ´ ou alerta de temperatura.",
    prioridade: "alta",
    ordem: 5
  },
  {
    id: "problema-eletrico",
    icone: "ELE",
    titulo: "Problema eletrico",
    tipo: "Auto Eletrica",
    descricao: "Falha elÃ©trica, igniÃ§Ã£o, painel, luzes ou parte eletrÃ´nica.",
    prioridade: "alta",
    ordem: 6
  },
  {
    id: "pane-seca",
    icone: "COMB",
    titulo: "Sem combustivel",
    tipo: "Guincho",
    descricao: "Pane seca ou necessidade de retirar o carro com seguranÃ§a.",
    prioridade: "media",
    ordem: 7
  },
  {
    id: "trancado-fora",
    icone: "CHAVE",
    titulo: "Trancado fora",
    tipo: "Chaveiro",
    descricao: "Chave travada, perdida, quebrada ou esquecida no carro.",
    prioridade: "media",
    ordem: 8
  },
  {
    id: "ar-condicionado",
    icone: "AR",
    titulo: "Ar-condicionado parou",
    tipo: "Ar Condicionado",
    descricao: "Falha no ar, ventilaÃ§Ã£o sem gelar ou pane na climatizaÃ§Ã£o.",
    prioridade: "normal",
    ordem: 9
  }
]

const ORDEM_PRIORIDADE = {
  alta: 0,
  media: 1,
  normal: 2
}

function normalizarTexto(valor) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function normalizarCategoria(valor) {
  const texto = normalizarTexto(String(valor || "")).replace(/[^a-z]/g, "")

  if (texto.includes("guin")) return "guincho"
  if (texto.includes("bater")) return "bateria"
  if (texto.includes("borr")) return "borracheiro"
  if (texto.includes("mec")) return "mecanico"
  if (texto.includes("ele")) return "autoeletrica"
  if (texto.includes("chav")) return "chaveiro"
  if (texto.includes("cond")) return "arcondicionado"

  return texto
}

export default function Socorro() {
  const [problemaSelecionado, setProblemaSelecionado] = useState(null)
  const [prestadorSelecionado, setPrestadorSelecionado] = useState(null)
  const [detalhes, setDetalhes] = useState("")
  const [localizacao, setLocalizacao] = useState("Localizacao nao informada")
  const [prestadores, setPrestadores] = useState([])
  const [assinatura, setAssinatura] = useState(null)
  const [pacotes, setPacotes] = useState([])

  useEffect(() => {
    async function carregarDados() {
      const [listaPrestadores, assinaturaAtual, listaPacotes] = await Promise.all([
        listPrestadores(),
        getAssinaturaAtual(),
        listPacotes()
      ])

      setPrestadores(listaPrestadores)
      setAssinatura(assinaturaAtual)
      setPacotes(listaPacotes)
    }

    carregarDados()

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5)
        const lng = pos.coords.longitude.toFixed(5)
        setLocalizacao(`Lat ${lat}, Lng ${lng}`)
      },
      () => {
        setLocalizacao("Localizacao nao informada")
      }
    )
  }, [])

  const profissionais = useMemo(() => {
    if (!problemaSelecionado) {
      return []
    }

    return prestadores.filter(
      (prestador) => normalizarCategoria(prestador.tipo) === normalizarCategoria(problemaSelecionado.tipo)
    )
  }, [prestadores, problemaSelecionado])

  const opcoesOrdenadas = useMemo(
    () =>
      [...OPCOES_SOCORRO].sort((a, b) => {
        const ordemA = a.ordem ?? Number.MAX_SAFE_INTEGER
        const ordemB = b.ordem ?? Number.MAX_SAFE_INTEGER

        if (ordemA !== ordemB) {
          return ordemA - ordemB
        }

        const prioridadeA = ORDEM_PRIORIDADE[a.prioridade] ?? ORDEM_PRIORIDADE.normal
        const prioridadeB = ORDEM_PRIORIDADE[b.prioridade] ?? ORDEM_PRIORIDADE.normal

        if (prioridadeA !== prioridadeB) {
          return prioridadeA - prioridadeB
        }

        return a.titulo.localeCompare(b.titulo)
      }),
    []
  )

  function selecionarProblema(opcao) {
    setProblemaSelecionado(opcao)
    setPrestadorSelecionado(null)
    setDetalhes("")
  }

  function montarMensagem(profissional = null) {
    if (!problemaSelecionado) {
      return ""
    }

    const partes = [`Ola, aconteceu o seguinte: ${problemaSelecionado.titulo.toLowerCase()}.`]

    if (detalhes.trim()) {
      partes.push(`Detalhes: ${detalhes.trim()}.`)
    }

    partes.push(`Localizacao aproximada: ${localizacao}.`)

    if (profissional) {
      partes.push(`Estou entrando em contato com ${profissional.nome}.`)
    }

    partes.push("Pode me ajudar agora?")

    return partes.join(" ")
  }

  async function pedirAjuda() {
    if (!problemaSelecionado || !prestadorSelecionado) return

    const permitido = await podeUsarChamado()
    if (!permitido) {
      alert("VocÃª nÃ£o possui um pacote ativo ou excedeu o limite de chamados. Assine um pacote para continuar.")
      return
    }

    await createChamado(prestadorSelecionado, {
      prioridade: problemaSelecionado.prioridade,
      problema: problemaSelecionado.titulo,
      detalhes: detalhes.trim() || null,
      localizacao
    })

    await registrarUsoChamado()
    setAssinatura(await getAssinaturaAtual())

    const mensagem = montarMensagem(prestadorSelecionado)

    window.open(
      `https://wa.me/55${prestadorSelecionado.telefone}?text=${encodeURIComponent(mensagem)}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  const pacote = assinatura ? pacotes.find((item) => item.id === assinatura.pacoteId) : null

  return (
    <div className="socorroPage">
      <section className="socorroHero">
        <div>
          <p className="socorroEyebrow">SOS Carro</p>
          <h1>Socorro Automotivo</h1>
          <p>Selecione o problema mais comum do seu carro e fale com o profissional certo.</p>
          <small className="socorroLocalizacao">{localizacao}</small>
        </div>

        <HomeBackButton />
      </section>

      {assinatura && assinatura.status === "ativo" && pacote && (
        <section className="socorroPacote">
          <div className="pacoteStatus">
            <span className="pacoteIcon">OK</span>
            <div>
              <strong>Pacote {pacote.nome} ativo</strong>
              <p>Chamados restantes: {pacote.maxChamados === -1 ? "Ilimitados" : pacote.maxChamados - assinatura.chamadosUsados}</p>
            </div>
          </div>
        </section>
      )}

      {!assinatura || assinatura.status !== "ativo" ? (
        <section className="socorroPacote">
          <div className="pacoteAviso">
            <span className="pacoteIcon">AT</span>
            <div>
              <strong>Sem pacote ativo</strong>
              <p>Assine um pacote mensal para acessar os serviÃ§os de emergÃªncia com valores fixos.</p>
              <a href="/pacotes" style={{ color: "#2196f3", textDecoration: "underline" }}>Ver pacotes</a>
            </div>
          </div>
        </section>
      ) : null}

      <section className="socorroPergunta">
        <div className="socorroPerguntaHeader">
          <strong>O que aconteceu?</strong>
          <p>Mostramos primeiro os casos mais urgentes e mais procurados no mercado.</p>
        </div>

        <div className="socorroGrid">
          {opcoesOrdenadas.map((opcao) => (
            <button
              key={opcao.id}
              type="button"
              className={`socorroTipoCard ${problemaSelecionado?.id === opcao.id ? "active" : ""}`}
              onClick={() => selecionarProblema(opcao)}
            >
              <span className="socorroTipoIcon">{opcao.icone}</span>
              <strong>{opcao.titulo}</strong>
              <span>{opcao.descricao}</span>
            </button>
          ))}
        </div>
      </section>

      {problemaSelecionado && (
        <section className="socorroResultados">
          <div className="socorroResultadosHeader">
            <div>
              <h2>Quem pode te ajudar?</h2>
              <p>Selecione um profissional para o caso: {problemaSelecionado.titulo}.</p>
            </div>

            <button type="button" onClick={() => selecionarProblema(null)}>
              Limpar selecao
            </button>
          </div>

          {profissionais.length === 0 ? (
            <div className="socorroEmpty">
              Nenhum profissional dessa categoria foi encontrado no momento.
            </div>
          ) : (
            <>
              <div className="socorroDetalhesBox">
                <label htmlFor="socorro-detalhes">Conte rapidamente o que aconteceu</label>
                <textarea
                  id="socorro-detalhes"
                  value={detalhes}
                  onChange={(e) => setDetalhes(e.target.value)}
                  placeholder="Exemplo: estou na marginal, o carro apagou e nao volta a ligar."
                />
              </div>

              <div className="socorroProfissionais">
                {profissionais.map((prestador) => (
                  <article
                    key={prestador.id}
                    className={`socorroProfissionalCard ${
                      prestadorSelecionado?.id === prestador.id ? "active" : ""
                    }`}
                    onClick={() => setPrestadorSelecionado(prestador)}
                  >
                    <div className="socorroProfissionalTop">
                      <span className="socorroProfissionalIcon">{problemaSelecionado.icone}</span>

                      <div>
                        <h3>{prestador.nome}</h3>
                        <p>{prestador.tipo}</p>
                        <small>{prestador.cidade}</small>
                      </div>
                    </div>

                    <div className="socorroProfissionalActions">
                      <WhatsAppButton
                        href={`https://wa.me/55${prestador.telefone}?text=${encodeURIComponent(
                          montarMensagem(prestador)
                        )}`}
                      />
                    </div>
                  </article>
                ))}
              </div>

              <div className="socorroAjudaBox">
                <div>
                  <strong>
                    {prestadorSelecionado
                      ? `Profissional escolhido: ${prestadorSelecionado.nome}`
                      : "Selecione um profissional para continuar"}
                  </strong>
                  <p>
                    {prestadorSelecionado
                      ? "Quando clicar em Peca ajuda, o chamado sera registrado e o WhatsApp sera aberto com os detalhes e a localizacao."
                      : "Escolha um card acima para direcionar o pedido corretamente."}
                  </p>
                </div>

                <PrimaryActionButton
                  onClick={pedirAjuda}
                  label="Peca ajuda"
                  className="socorroAjudaButton"
                />
              </div>
            </>
          )}
        </section>
      )}
    </div>
  )
}
