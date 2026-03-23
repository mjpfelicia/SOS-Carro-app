import { formatarData, getChamados } from "../services/storage"
import HomeBackButton from "../components/HomeBackButton"
import "./DashboardPages.css"

const ORDEM_PRIORIDADE = {
  alta: 0,
  media: 1,
  normal: 2
}

function getPrioridadeLabel(prioridade) {
  if (prioridade === "alta") return "Alta prioridade"
  if (prioridade === "media") return "Prioridade media"
  return "Prioridade normal"
}

export default function Historico() {
  const chamados = getChamados().slice().sort((a, b) => {
    const prioridadeA = ORDEM_PRIORIDADE[a.prioridade] ?? ORDEM_PRIORIDADE.normal
    const prioridadeB = ORDEM_PRIORIDADE[b.prioridade] ?? ORDEM_PRIORIDADE.normal

    if (prioridadeA !== prioridadeB) {
      return prioridadeA - prioridadeB
    }

    return new Date(b.data).getTime() - new Date(a.data).getTime()
  })

  return (
    <div className="dashboardPage">
      <div className="dashboardHeader">
        <div>
          <h1>Historico de Chamados</h1>
          <p>Registro local das solicitacoes feitas para prestadores.</p>
        </div>
        <div className="dashboardActions">
          <HomeBackButton />
        </div>
      </div>

      <div className="dashboardList">
        {chamados.length === 0 ? (
          <section className="dashboardCard">
            <p>Nenhum chamado foi registrado ainda.</p>
          </section>
        ) : (
          chamados.map((chamado) => (
            <section key={chamado.id} className="dashboardCard">
              <h2>{chamado.nomePrestador}</h2>
              <p>
                {chamado.tipo} • {chamado.cidade}
              </p>
              <small>Telefone: {chamado.telefone}</small>
              <small>Status: {chamado.status}</small>
              <small>{getPrioridadeLabel(chamado.prioridade)}</small>
              <small>Solicitado em: {formatarData(chamado.data)}</small>
            </section>
          ))
        )}
      </div>
    </div>
  )
}
