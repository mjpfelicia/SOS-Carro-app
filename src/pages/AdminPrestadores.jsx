import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  getPrestadores,
  getResumoAvaliacao,
  removePrestador,
  updatePrestador
} from "../services/storage"
import "./DashboardPages.css"

export default function AdminPrestadores() {
  const navigate = useNavigate()
  const [prestadores, setPrestadores] = useState([])
  const [edicao, setEdicao] = useState({})

  function carregar() {
    setPrestadores(getPrestadores())
  }

  useEffect(() => {
    carregar()
  }, [])

  function iniciarEdicao(prestador) {
    setEdicao((current) => ({
      ...current,
      [prestador.id]: { ...prestador }
    }))
  }

  function atualizarCampo(prestadorId, campo, valor) {
    setEdicao((current) => ({
      ...current,
      [prestadorId]: {
        ...current[prestadorId],
        [campo]: valor
      }
    }))
  }

  function salvar(prestadorId) {
    updatePrestador(prestadorId, edicao[prestadorId])
    carregar()
    setEdicao((current) => {
      const next = { ...current }
      delete next[prestadorId]
      return next
    })
  }

  function excluir(prestadorId) {
    removePrestador(prestadorId)
    carregar()
  }

  return (
    <div className="dashboardPage">
      <div className="dashboardHeader">
        <div>
          <h1>Painel Administrativo</h1>
          <p>Gerencie os prestadores cadastrados, edite dados e acompanhe reputacao.</p>
        </div>

        <div className="dashboardActions">
          <button onClick={() => navigate("/cadastro-prestador")}>Novo prestador</button>
          <button onClick={() => navigate("/")}>Voltar para home</button>
        </div>
      </div>

      <div className="dashboardList">
        {prestadores.map((prestador) => {
          const resumo = getResumoAvaliacao(prestador.id)
          const itemEdicao = edicao[prestador.id]

          return (
            <section key={prestador.id} className="dashboardCard">
              <div className="dashboardCardTop">
                <div>
                  <h2>{prestador.nome}</h2>
                  <p>
                    {prestador.tipo} • {prestador.cidade}
                  </p>
                  <small>
                    Nota media: {resumo.total > 0 ? `${resumo.media}/5` : "Sem avaliacoes"} •{" "}
                    {resumo.total} comentarios
                  </small>
                </div>

                <div className="dashboardCardButtons">
                  <button onClick={() => iniciarEdicao(prestador)}>Editar</button>
                  <button className="danger" onClick={() => excluir(prestador.id)}>
                    Excluir
                  </button>
                </div>
              </div>

              {itemEdicao && (
                <div className="inlineForm">
                  <input
                    value={itemEdicao.nome}
                    onChange={(e) => atualizarCampo(prestador.id, "nome", e.target.value)}
                  />
                  <input
                    value={itemEdicao.telefone}
                    onChange={(e) => atualizarCampo(prestador.id, "telefone", e.target.value)}
                  />
                  <input
                    value={itemEdicao.tipo}
                    onChange={(e) => atualizarCampo(prestador.id, "tipo", e.target.value)}
                  />
                  <input
                    value={itemEdicao.cidade}
                    onChange={(e) => atualizarCampo(prestador.id, "cidade", e.target.value)}
                  />
                  <button onClick={() => salvar(prestador.id)}>Salvar alteracoes</button>
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
