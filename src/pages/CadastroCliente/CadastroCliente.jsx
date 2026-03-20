import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createUsuario, getUsuarios } from "../../services/storage"
import "./CadastroCliente.css"

export default function CadastroCliente() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: ""
  })
  const [erro, setErro] = useState("")

  function handleChange(e) {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()

    const usuarios = getUsuarios()
    const emailJaExiste = usuarios.some((usuario) => usuario.email === form.email)

    if (emailJaExiste) {
      setErro("Ja existe um cadastro com esse email.")
      return
    }

    createUsuario(form)
    setErro("")
    alert("Cliente cadastrado com sucesso!")
    navigate("/")
  }

  return (
    <div className="cadastroContainer">
      <h1>Cadastro Cliente</h1>

      <form className="cadastroForm" onSubmit={handleSubmit}>
        <input
          id="nome"
          placeholder="Nome"
          value={form.nome}
          onChange={handleChange}
          required
        />

        <input
          id="email"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          id="senha"
          placeholder="Senha"
          type="password"
          value={form.senha}
          onChange={handleChange}
          required
        />

        <button type="submit">Cadastrar</button>
      </form>

      {erro && <p className="feedbackError">{erro}</p>}

      <p className="voltarLogin" onClick={() => navigate("/login")}>
        Ja tem conta? <span>Entrar</span>
      </p>
    </div>
  )
}
