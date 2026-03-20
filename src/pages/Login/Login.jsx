import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { autenticarUsuario } from "../../services/storage"
import "./Login.css"

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")

  function handleSubmit(e) {
    e.preventDefault()

    const usuario = autenticarUsuario(email, senha)

    if (!usuario) {
      setErro("Nao encontramos um usuario com esse email e senha.")
      return
    }

    setErro("")
    alert(`Bem-vindo, ${usuario.nome}!`)
    navigate("/")
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
    </div>
  )
}
