import { useNavigate } from "react-router-dom"

export default function HomeBackButton({ className = "", label = "🏠 Voltar para home" }) {
  const navigate = useNavigate()
  const classes = ["homeBackButton", className].filter(Boolean).join(" ")

  return (
    <button type="button" className={classes} onClick={() => navigate("/")}>
      {label}
    </button>
  )
}
