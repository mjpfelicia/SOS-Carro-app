import { useEffect, useMemo, useState } from "react"
import HomeBackButton from "../components/HomeBackButton"
import { listFavoritosIds } from "../services/favoritosService"
import { listPrestadores } from "../services/prestadoresService"
import {
  getResumoAvaliacaoFromList,
  listAvaliacoesByPrestadores
} from "../services/avaliacoesService"
import "./DashboardPages.css"

export default function Favoritos() {
  const [favoritos, setFavoritos] = useState([])
  const [prestadores, setPrestadores] = useState([])
  const [avaliacoesPorPrestador, setAvaliacoesPorPrestador] = useState({})

  useEffect(() => {
    async function carregar() {
      const [favoritosIds, listaPrestadores] = await Promise.all([
        listFavoritosIds(),
        listPrestadores()
      ])

      setFavoritos(favoritosIds)
      setPrestadores(listaPrestadores)
    }

    carregar()
  }, [])

  useEffect(() => {
    async function carregarAvaliacoes() {
      if (!prestadores.length) {
        setAvaliacoesPorPrestador({})
        return
      }

      const dados = await listAvaliacoesByPrestadores(prestadores.map((prestador) => prestador.id))
      setAvaliacoesPorPrestador(dados)
    }

    carregarAvaliacoes()
  }, [prestadores])

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
            const resumo = getResumoAvaliacaoFromList(avaliacoesPorPrestador[prestador.id] || [])

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
