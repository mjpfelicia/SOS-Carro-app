import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../providers/AuthProvider"
import { signUp } from "../../services/authService"
import "./CadastroCliente.css"

export default function CadastroCliente() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: ""
  })
  const [erro, setErro] = useState("")

  function handleChange(e) {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      const resultado = await signUp(form)
      await refreshUser()
      setErro("")
      alert(
        resultado?.requerConfirmacaoEmail
          ? "Cadastro realizado. Confirme seu email para concluir o acesso."
          : "Cliente cadastrado com sucesso!"
      )
      navigate("/")
    } catch (error) {
      setErro(error.message)
    }
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
          id="telefone"
          placeholder="Telefone (opcional)"
          value={form.telefone}
          onChange={handleChange}
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
