import "./CadastroCliente.css"

export default function CadastroCliente(){

  function handleSubmit(e){
    e.preventDefault()

    alert("Cliente cadastrado com sucesso!")
  }

  return (

    <div className="cadastroContainer">

      <h1>Cadastro Cliente</h1>

      <form className="cadastroForm" onSubmit={handleSubmit}>

        <input
          id="nome"
          placeholder="Nome"
        />

        <input
          id="email"
          placeholder="Email"
        />

        <input
          id="senha"
          placeholder="Senha"
          type="password"
        />

        <button type="submit">
          Cadastrar
        </button>

      </form>

    </div>

  )
}