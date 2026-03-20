import "./Login.css"
import { useNavigate } from "react-router-dom"

export default function Login({ onLogin }) {

  const navigate = useNavigate()

  function handleSubmit(e){
    e.preventDefault()
    onLogin()
  }

  return (

    <div className="loginContainer">

      <h1>🚗 SOS Carro</h1>

      <form className="loginForm" onSubmit={handleSubmit}>

        <input
          type="email"
          placeholder="Email"
        />

        <input
          type="password"
          placeholder="Senha"
        />

        <button type="submit">
          Entrar
        </button>

      </form>

      <div className="register">
        Não tem conta?{" "}
        <span
          style={{color:"#e53935", cursor:"pointer"}}
          onClick={() => navigate("/cadastro-cliente")}
        >
          Cadastre-se
        </span>
      </div>

    </div>

  )
}