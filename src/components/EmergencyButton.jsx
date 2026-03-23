import { useNavigate } from "react-router-dom"

export default function EmergencyButton() {
  const navigate = useNavigate()

  return (
    <button type="button" className="emergencyCta" onClick={() => navigate("/socorro")}>
      <span className="emergencyCtaBadge">🚨</span>
      <span className="emergencyCtaContent">
        <strong>Socorro Automotivo</strong>
        <small>Escolha o tipo de ajuda e encontre o profissional certo.</small>
      </span>
      <span className="emergencyCtaArrow">⚡ Ver catalogo</span>
    </button>
  )
}
