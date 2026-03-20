import "./CadastroPrestador.css"

export default function CadastroPrestador() {

  function handleSubmit(e){
    e.preventDefault()

    const nome = document.getElementById("nome").value
    const telefone = document.getElementById("telefone").value
    const tipo = document.getElementById("tipo").value
    const cidade = document.getElementById("cidade").value

    const novoPrestador = {
      nome,
      telefone,
      tipo,
      cidade
    }

    // pegar lista existente
    const lista = JSON.parse(localStorage.getItem("prestadores")) || []

    // adicionar novo
    lista.push(novoPrestador)

    // salvar novamente
    localStorage.setItem("prestadores", JSON.stringify(lista))

    alert("Prestador cadastrado com sucesso!")

    // limpar campos
    document.getElementById("nome").value = ""
    document.getElementById("telefone").value = ""
    document.getElementById("cidade").value = ""
  }

  return (

    <div className="cadastro">

      <h1>Cadastrar Prestador</h1>

      <form onSubmit={handleSubmit}>

        <input id="nome" placeholder="Nome do profissional" />

        <input id="telefone" placeholder="Telefone / WhatsApp" />

        <select id="tipo">
          <option>Tipo de serviço</option>
          <option>Mecânico</option>
          <option>Borracheiro</option>
          <option>Bateria</option>
          <option>Guincho</option>
          <option>Troca de Óleo</option>
          <option>Auto Elétrica</option>
          <option>Chaveiro</option>
          <option>Ar Condicionado</option>
        </select>

        <input id="cidade" placeholder="Cidade" />

        <button type="submit">
          Cadastrar
        </button>

      </form>

    </div>

  )
}