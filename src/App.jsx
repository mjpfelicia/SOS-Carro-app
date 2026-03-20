import { BrowserRouter, Routes, Route } from "react-router-dom"
import "leaflet/dist/leaflet.css"

import Home from "./pages/Home/Home"
import Login from "./pages/Login/Login"
import CadastroCliente from "./pages/CadastroCliente/CadastroCliente"
import CadastroPrestador from "./pages/CadastroPrestador/CadastroPrestador"

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro-cliente" element={<CadastroCliente />} />
        <Route path="/cadastro-cliente" element={<CadastroCliente />} />
        <Route path="/cadastro-prestador" element={<CadastroPrestador />} />


      </Routes>

    </BrowserRouter>

  )

}

export default App