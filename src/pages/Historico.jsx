import { useNavigate } from "react-router-dom"
import { formatarData, getChamados } from "../services/storage"
import "./DashboardPages.css"

export default function Historico() {
  const navigate = useNavigate()
  const chamados = getChamados()

  return (
    <div className="dashboardPage">
      <div className="dashboardHeader">
        <div>
          <h1>Historico de Chamados</h1>
          <p>Registro local das solicitacoes feitas para prestadores.</p>
        </div>
        <div className="dashboardActions">
          <button onClick={() => navigate("/")}>Voltar para home</button>
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
              <small>Solicitado em: {formatarData(chamado.data)}</small>
            </section>
          ))
        )}
      </div>
    </div>
  )
}
