import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createPrestador } from "../../services/storage"
import "./CadastroPrestador.css"

const TIPOS = [
  "Mecânico",
  "Borracheiro",
  "Bateria",
  "Guincho",
  "Troca de Óleo",
  "Auto Elétrica",
  "Chaveiro",
  "Ar Condicionado"
]

export default function CadastroPrestador() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    tipo: TIPOS[0],
    cidade: ""
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    createPrestador(form)

    alert("Prestador cadastrado com sucesso!")

    setForm({
      nome: "",
      telefone: "",
      tipo: TIPOS[0],
      cidade: ""
    })

    navigate("/admin")
  }

  return (
    <div className="cadastro">
      <h1>Cadastrar Prestador</h1>

      <form onSubmit={handleSubmit}>
        <input
          id="nome"
          placeholder="Nome do profissional"
          value={form.nome}
          onChange={handleChange}
          required
        />

        <input
          id="telefone"
          placeholder="Telefone / WhatsApp"
          value={form.telefone}
          onChange={handleChange}
          required
        />

        <select id="tipo" value={form.tipo} onChange={handleChange}>
          {TIPOS.map((tipo) => (
            <option key={tipo}>{tipo}</option>
          ))}
        </select>

        <input
          id="cidade"
          placeholder="Cidade"
          value={form.cidade}
          onChange={handleChange}
          required
        />

        <button type="submit">Cadastrar</button>
      </form>
    </div>
  )
}
