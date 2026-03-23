import { useNavigate } from "react-router-dom"
import {
  getChamados,
  getFavoritos,
  getUsuarioAtual,
  logoutUsuario
} from "../services/storage"
import HomeBackButton from "../components/HomeBackButton"
import "./DashboardPages.css"

export default function Profile() {
  const navigate = useNavigate()
  const usuario = getUsuarioAtual()
  const favoritos = getFavoritos()
  const chamados = getChamados()

  function sair() {
    logoutUsuario()
    navigate("/")
  }

  return (
    <div className="dashboardPage">
      <div className="dashboardHeader">
        <div>
          <h1>Perfil</h1>
          <p>Resumo do usuario atual e dos dados persistidos no navegador.</p>
        </div>
        <div className="dashboardActions">
          <HomeBackButton />
          {!usuario && <button onClick={() => navigate("/login")}>Entrar</button>}
          {usuario && <button onClick={sair}>Sair</button>}
        </div>
      </div>

      <div className="dashboardGrid">
        <section className="dashboardCard">
          <h2>Usuario atual</h2>
          {usuario ? (
            <>
              <p>{usuario.nome}</p>
              <small>{usuario.email}</small>
              <small>Perfil: {usuario.role === "admin" ? "Administrador" : "Cliente"}</small>
            </>
          ) : (
            <p>Nenhum usuario autenticado. O app esta em modo visitante.</p>
          )}
        </section>

        <section className="dashboardCard">
          <h2>Favoritos</h2>
          <p>{favoritos.length} prestadores salvos</p>
        </section>

        <section className="dashboardCard">
          <h2>Chamados</h2>
          <p>{chamados.length} solicitacoes registradas</p>
        </section>
      </div>
    </div>
  )
}
