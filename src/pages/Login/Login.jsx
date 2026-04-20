import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../providers/AuthProvider"
import { signIn } from "../../services/authService"
import "./Login.css"

export default function Login() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      const usuario = await signIn({ email, senha })
      await refreshUser()
      setErro("")
      alert(`Bem-vindo, ${usuario.nome}!`)
      navigate("/")
    } catch (error) {
      setErro(error.message || "Nao foi possivel entrar agora.")
    }
  }

  return (
    <div className="loginContainer">
      <h1>SOS Carro</h1>

      <form className="loginForm" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <button type="submit">Entrar</button>
      </form>

      {erro && <p className="feedbackError">{erro}</p>}

      <div className="register">
        Nao tem conta?{" "}
        <span
          style={{ color: "#e53935", cursor: "pointer" }}
          onClick={() => navigate("/cadastro-cliente")}
        >
          Cadastre-se
        </span>
      </div>

      <p className="register">
        Admin de teste: <strong>admin@soscarro.com</strong> / <strong>admin123</strong>
      </p>
    </div>
  )
}
