import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { getPacotes, assinarPacote, getAssinaturaAtual } from "../services/storage"
import HomeBackButton from "../components/HomeBackButton"
import "./DashboardPages.css"

export default function Pacotes() {
  const navigate = useNavigate()
  const pacotes = getPacotes()
  const assinaturaAtual = getAssinaturaAtual()
  const [assinando, setAssinando] = useState(false)

  function handleAssinar(pacoteId) {
    if (assinando) return

    try {
      setAssinando(true)
      assinarPacote(pacoteId)
      alert("Pacote assinado com sucesso!")
      navigate("/perfil")
    } catch (error) {
      alert("Erro ao assinar pacote: " + error.message)
    } finally {
      setAssinando(false)
    }
  }

  return (
    <div className="dashboardPage">
      <div className="dashboardHeader">
        <div>
          <h1>Pacotes de Socorro</h1>
          <p>Assine um pacote mensal e tenha valores fixos nos serviços de emergência</p>
        </div>
        <HomeBackButton />
      </div>

      {assinaturaAtual && assinaturaAtual.status === "ativo" && (
        <div className="dashboardCard" style={{ backgroundColor: "#e8f5e8", border: "1px solid #4caf50" }}>
          <h2>✅ Pacote Ativo</h2>
          <p>Você possui um pacote ativo até {new Date(assinaturaAtual.dataFim).toLocaleDateString("pt-BR")}</p>
          <p>Chamados usados: {assinaturaAtual.chamadosUsados}</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        {pacotes.map((pacote) => (
          <div key={pacote.id} className="dashboardCard">
            <h2>{pacote.nome}</h2>
            <div style={{ fontSize: "2em", fontWeight: "bold", color: "#2196f3", margin: "10px 0" }}>
              R$ {pacote.preco.toFixed(2)}/{pacote.periodo}
            </div>
            <p>{pacote.descricao}</p>

            <ul style={{ textAlign: "left", margin: "15px 0" }}>
              {pacote.beneficios.map((beneficio, index) => (
                <li key={index} style={{ marginBottom: "5px" }}>✓ {beneficio}</li>
              ))}
            </ul>

            <button
              onClick={() => handleAssinar(pacote.id)}
              disabled={assinando || (assinaturaAtual && assinaturaAtual.status === "ativo")}
              style={{
                backgroundColor: assinaturaAtual && assinaturaAtual.status === "ativo" ? "#ccc" : "#2196f3",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: assinaturaAtual && assinaturaAtual.status === "ativo" ? "not-allowed" : "pointer",
                width: "100%"
              }}
            >
              {assinaturaAtual && assinaturaAtual.status === "ativo" ? "Pacote Ativo" : assinando ? "Assinando..." : "Assinar Pacote"}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}