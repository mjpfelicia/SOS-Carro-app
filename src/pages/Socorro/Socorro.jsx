import { useEffect, useMemo, useState } from "react"
import { getPrestadores, registrarChamado } from "../../services/storage"
import HomeBackButton from "../../components/HomeBackButton"
import PrimaryActionButton from "../../components/PrimaryActionButton"
import WhatsAppButton from "../../components/WhatsAppButton"
import "./Socorro.css"

const OPCOES_SOCORRO = [
  {
    id: "pane-total",
    icone: "🚗",
    titulo: "Pane total 🚗",
    tipo: "Guincho",
    descricao: "Reboque para carro parado ou pane mais grave.",
    prioridade: "alta",
    ordem: 1
  },
  {
    id: "nao-liga",
    icone: "🔋",
    titulo: "Não liga 🔋",
    tipo: "Bateria",
    descricao: "Auxílio para bateria, carga ou partida emergencial.",
    prioridade: "alta",
    ordem: 2
  },
  {
    id: "pneu-furado",
    icone: "🛞",
    titulo: "Pneu furado 🛞",
    tipo: "Borracheiro",
    descricao: "Troca de pneu, estepe ou atendimento rápido na pista.",
    prioridade: "media",
    ordem: 3
  },
  {
    id: "preciso-mecanico",
    icone: "🔧",
    titulo: "Preciso de mecânico 🔧",
    tipo: "Mecanico",
    descricao: "Falha no motor, barulhos estranhos ou defeito mecânico.",
    prioridade: "media",
    ordem: 4
  },
  {
    id: "superaquecimento",
    icone: "🌡️",
    titulo: "Superaquecimento 🌡️",
    tipo: "Mecanico",
    descricao: "Motor esquentando, vapor no capô ou alerta de temperatura.",
    prioridade: "alta",
    ordem: 5
  },
  {
    id: "problema-eletrico",
    icone: "⚡",
    titulo: "Problema elétrico ⚡",
    tipo: "Auto Eletrica",
    descricao: "Falha elétrica, ignição, painel, luzes ou parte eletrônica.",
    prioridade: "alta",
    ordem: 6
  },
  {
    id: "pane-seca",
    icone: "⛽",
    titulo: "Sem combustível ⛽",
    tipo: "Guincho",
    descricao: "Pane seca ou necessidade de retirar o carro com segurança.",
    prioridade: "media",
    ordem: 7
  },
  {
    id: "trancado-fora",
    icone: "🔑",
    titulo: "Trancado fora 🔑",
    tipo: "Chaveiro",
    descricao: "Chave travada, perdida, quebrada ou esquecida no carro.",
    prioridade: "media",
    ordem: 8
  },
  {
    id: "ar-condicionado",
    icone: "❄️",
    titulo: "Ar-condicionado parou ❄️",
    tipo: "Ar Condicionado",
    descricao: "Falha no ar, ventilação sem gelar ou pane na climatização.",
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

export default function Socorro() {
  const [problemaSelecionado, setProblemaSelecionado] = useState(null)
  const [prestadorSelecionado, setPrestadorSelecionado] = useState(null)
  const [detalhes, setDetalhes] = useState("")
  const [localizacao, setLocalizacao] = useState("Localizacao nao informada")
  const prestadores = getPrestadores()

  useEffect(() => {
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
      (prestador) => normalizarTexto(prestador.tipo) === normalizarTexto(problemaSelecionado.tipo)
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

  function pedirAjuda() {
    if (!problemaSelecionado || !prestadorSelecionado) return

    registrarChamado({
      ...prestadorSelecionado,
      prioridade: problemaSelecionado.prioridade
    })
    const mensagem = montarMensagem(prestadorSelecionado)

    window.open(
      `https://wa.me/55${prestadorSelecionado.telefone}?text=${encodeURIComponent(mensagem)}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  return (
    <div className="socorroPage">
      <section className="socorroHero">
        <div>
          <p className="socorroEyebrow">🚗 SOS Carro</p>
          <h1>🚨 Socorro Automotivo</h1>
          <p>Selecione o problema mais comum do seu carro e fale com o profissional certo.</p>
          <small className="socorroLocalizacao">📍 {localizacao}</small>
        </div>

        <HomeBackButton />
      </section>

      <section className="socorroPergunta">
        <div className="socorroPerguntaHeader">
          <strong>❓ O que aconteceu?</strong>
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
              <h2>👨‍🔧 Quem pode te ajudar?</h2>
              <p>Selecione um profissional para o caso: {problemaSelecionado.titulo}.</p>
            </div>

            <button type="button" onClick={() => selecionarProblema(null)}>
              ✖️ Limpar selecao
            </button>
          </div>

          {profissionais.length === 0 ? (
            <div className="socorroEmpty">
              Nenhum profissional dessa categoria foi encontrado no momento.
            </div>
          ) : (
            <>
              <div className="socorroDetalhesBox">
                <label htmlFor="socorro-detalhes">📝 Conte rapidamente o que aconteceu</label>
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
                      ? `✅ Profissional escolhido: ${prestadorSelecionado.nome}`
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
                  label="🚨 Peca ajuda"
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
