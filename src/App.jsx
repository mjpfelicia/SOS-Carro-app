import { BrowserRouter, Route, Routes } from "react-router-dom"
import "leaflet/dist/leaflet.css"

import Home from "./pages/Home/Home.jsx"
import Login from "./pages/Login/Login.jsx"
import CadastroCliente from "./pages/CadastroCliente/CadastroCliente.jsx"
import CadastroPrestador from "./pages/CadastroPrestador/CadastroPrestador.jsx"
import Favoritos from "./pages/Favoritos.jsx"
import Historico from "./pages/Historico.jsx"
import AdminPrestadores from "./pages/AdminPrestadores.jsx"
import Profile from "./pages/Profile.jsx"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro-cliente" element={<CadastroCliente />} />
        <Route path="/cadastro-prestador" element={<CadastroPrestador />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="/admin" element={<AdminPrestadores />} />
        <Route path="/perfil" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
