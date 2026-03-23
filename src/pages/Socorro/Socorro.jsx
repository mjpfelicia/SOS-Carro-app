import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getPrestadores, registrarChamado } from "../../services/storage"
import "./Socorro.css"

const OPCOES_SOCORRO = [
  {
    id: "troca-pneu",
    icone: "🛞",
    iconeProfissional: "🛞",
    titulo: "Troca de pneu",
    tipo: "Borracheiro",
    descricao: "Para pneu furado, estepe, calibragem e troca imediata."
  },
  {
    id: "guincho",
    icone: "🚚",
    iconeProfissional: "🚚",
    titulo: "Guincho",
    tipo: "Guincho",
    descricao: "Para carro parado, pane total ou necessidade de reboque."
  },
  {
    id: "chaveiro",
    icone: "🗝️",
    iconeProfissional: "🗝️",
    titulo: "Chaveiro",
    tipo: "Chaveiro",
    descricao: "Para chave quebrada, perdida ou travada dentro do carro."
  },
  {
    id: "pane-mecanica",
    icone: "🔧",
    iconeProfissional: "🔧",
    titulo: "Pane mecanica",
    tipo: "Mecanico",
    descricao: "Para falha no motor, superaquecimento ou problema tecnico."
  }
]

function normalizarTexto(valor) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

export default function Socorro() {
  const navigate = useNavigate()
  const [selecionado, setSelecionado] = useState(null)
  const prestadores = getPrestadores()

  const profissionais = useMemo(() => {
    if (!selecionado) {
      return []
    }

    return prestadores.filter(
      (prestador) => normalizarTexto(prestador.tipo) === normalizarTexto(selecionado.tipo)
    )
  }, [prestadores, selecionado])

  function acionarSocorro(prestador) {
    if (!selecionado) return

    registrarChamado(prestador)

    const mensagem = `Ola, preciso de ${selecionado.titulo.toLowerCase()} com urgencia. Pode me atender agora?`

    window.open(
      `https://wa.me/55${prestador.telefone}?text=${encodeURIComponent(mensagem)}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  return (
    <div className="socorroPage">
      <section className="socorroHero">
        <div>
          <p className="socorroEyebrow">🚗 SOS Carro</p>
          <h1>🚨 Catalogo de Socorro Automotivo</h1>
          <p>
            Escolha o tipo de emergencia e veja os profissionais preparados para atender voce.
          </p>
        </div>

        <button type="button" className="homeBackButton" onClick={() => navigate("/")}>
          🏠 Voltar para home
        </button>
      </section>

      <section className="socorroGrid">
        {OPCOES_SOCORRO.map((opcao) => (
          <button
            key={opcao.id}
            type="button"
            className={`socorroTipoCard ${selecionado?.id === opcao.id ? "active" : ""}`}
            onClick={() => setSelecionado(opcao)}
          >
            <span className="socorroTipoIcon">{opcao.icone}</span>
            <strong>{opcao.titulo}</strong>
            <span>{opcao.descricao}</span>
          </button>
        ))}
      </section>

      {selecionado && (
        <section className="socorroResultados">
          <div className="socorroResultadosHeader">
            <div>
              <h2>{selecionado.titulo}</h2>
              <p>Profissionais indicados para esse tipo de socorro.</p>
            </div>

            <button type="button" onClick={() => setSelecionado(null)}>
              ✖️ Limpar selecao
            </button>
          </div>

          {profissionais.length === 0 ? (
            <div className="socorroEmpty">
              Nenhum profissional dessa categoria foi encontrado no momento.
            </div>
          ) : (
            <div className="socorroProfissionais">
              {profissionais.map((prestador) => (
                <article key={prestador.id} className="socorroProfissionalCard">
                  <div className="socorroProfissionalTop">
                    <span className="socorroProfissionalIcon">
                      {selecionado.iconeProfissional}
                    </span>

                    <div>
                      <h3>{prestador.nome}</h3>
                      <p>{prestador.tipo}</p>
                      <small>{prestador.cidade}</small>
                    </div>
                  </div>

                  <div className="socorroProfissionalActions">
                    <a
                      href={`https://wa.me/55${prestador.telefone}?text=${encodeURIComponent(
                        `Ola, preciso de ${selecionado.titulo.toLowerCase()} com urgencia.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      💬 WhatsApp
                    </a>
                    <button type="button" onClick={() => acionarSocorro(prestador)}>
                      🚨 Acionar socorro
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
