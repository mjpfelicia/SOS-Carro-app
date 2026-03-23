import { useMemo } from "react"
import { getFavoritos, getPrestadores, getResumoAvaliacao } from "../services/storage"
import HomeBackButton from "../components/HomeBackButton"
import "./DashboardPages.css"

export default function Favoritos() {
  const favoritos = getFavoritos()
  const prestadores = getPrestadores()

  const lista = useMemo(
    () => prestadores.filter((prestador) => favoritos.includes(prestador.id)),
    [favoritos, prestadores]
  )

  return (
    <div className="dashboardPage">
      <div className="dashboardHeader">
        <div>
          <h1>Favoritos</h1>
          <p>Prestadores salvos para acesso rapido neste usuario.</p>
        </div>
        <div className="dashboardActions">
          <HomeBackButton />
        </div>
      </div>

      <div className="dashboardList">
        {lista.length === 0 ? (
          <section className="dashboardCard">
            <p>Voce ainda nao favoritou nenhum prestador.</p>
          </section>
        ) : (
          lista.map((prestador) => {
            const resumo = getResumoAvaliacao(prestador.id)

            return (
              <section key={prestador.id} className="dashboardCard">
                <h2>{prestador.nome}</h2>
                <p>
                  {prestador.tipo} • {prestador.cidade}
                </p>
                <small>
                  WhatsApp: {prestador.telefone} •{" "}
                  {resumo.total > 0 ? `${resumo.media}/5` : "Sem avaliacoes"}
                </small>
              </section>
            )
          })
        )}
      </div>
    </div>
  )
}
