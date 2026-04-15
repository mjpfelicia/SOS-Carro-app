import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  getChamados,
  getFavoritos,
  getUsuarioAtual,
  logoutUsuario,
  updateUsuario,
  getAssinaturaAtual,
  getPacotes
} from "../services/storage"
import HomeBackButton from "../components/HomeBackButton"
import "./DashboardPages.css"

export default function Profile() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(getUsuarioAtual())
  const [editando, setEditando] = useState(false)
  const [formData, setFormData] = useState({
    nome: usuario?.nome || "",
    email: usuario?.email || "",
    telefone: usuario?.telefone || ""
  })
  const favoritos = getFavoritos()
  const chamados = getChamados()
  const assinatura = getAssinaturaAtual()
  const pacote = assinatura ? getPacotes().find(p => p.id === assinatura.pacoteId) : null

  function sair() {
    logoutUsuario()
    navigate("/")
  }

  function iniciarEdicao() {
    setEditando(true)
    setFormData({
      nome: usuario?.nome || "",
      email: usuario?.email || "",
      telefone: usuario?.telefone || ""
    })
  }

  function cancelarEdicao() {
    setEditando(false)
  }

  function salvarEdicao() {
    try {
      const usuarioAtualizado = updateUsuario(formData)
      setUsuario(usuarioAtualizado)
      setEditando(false)
    } catch (error) {
      alert("Erro ao atualizar perfil: " + error.message)
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
          {usuario && !editando && <button onClick={iniciarEdicao}>Editar</button>}
          {usuario && <button onClick={sair}>Sair</button>}
        </div>
      </div>

      <div className="dashboardGrid">
        <section className="dashboardCard">
          <h2>Usuario atual</h2>
          {editando ? (
            <div>
              <div style={{ marginBottom: "10px" }}>
                <label>Nome:</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "5px" }}
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "5px" }}
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label>Telefone:</label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "5px" }}
                />
              </div>
              <div>
                <button onClick={salvarEdicao} style={{ marginRight: "10px" }}>Salvar</button>
                <button onClick={cancelarEdicao}>Cancelar</button>
              </div>
            </div>
          ) : usuario ? (
            <>
              <p>{usuario.nome}</p>
              <small>{usuario.email}</small>
              {usuario.telefone && <small>Telefone: {usuario.telefone}</small>}
              <small>Perfil: {usuario.role === "admin" ? "Administrador" : "Cliente"}</small>
            </>
          ) : (
            <p>Nenhum usuario autenticado. O app esta em modo visitante.</p>
          )}
        </section>

        <section className="dashboardCard">
          <h2>Assinatura</h2>
          {assinatura && assinatura.status === "ativo" && pacote ? (
            <>
              <p><strong>{pacote.nome}</strong></p>
              <p>Status: Ativo</p>
              <p>Válido até: {new Date(assinatura.dataFim).toLocaleDateString("pt-BR")}</p>
              <p>Chamados usados: {assinatura.chamadosUsados}</p>
              <p>Chamados restantes: {pacote.maxChamados === -1 ? "Ilimitados" : pacote.maxChamados - assinatura.chamadosUsados}</p>
            </>
          ) : (
            <>
              <p>Sem assinatura ativa</p>
              <button onClick={() => navigate("/pacotes")}  className="btn_dashboard">Ver Pacotes</button>
            </>
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
