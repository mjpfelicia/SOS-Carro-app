import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import "leaflet/dist/leaflet.css"

import Home from "./pages/Home/Home.jsx"
import Login from "./pages/Login/Login.jsx"
import CadastroCliente from "./pages/CadastroCliente/CadastroCliente.jsx"
import CadastroPrestador from "./pages/CadastroPrestador/CadastroPrestador.jsx"
import Favoritos from "./pages/Favoritos.jsx"
import Historico from "./pages/Historico.jsx"
import AdminPrestadores from "./pages/AdminPrestadores.jsx"
import Profile from "./pages/Profile.jsx"
import Socorro from "./pages/Socorro/Socorro.jsx"
import Pacotes from "./pages/Pacotes.jsx"
import { getUsuarioAtual, isAdmin } from "./services/storage.js"

function AdminRoute({ children }) {
  const usuario = getUsuarioAtual()

  if (!isAdmin(usuario)) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter basename="/sos-carro-app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro-cliente" element={<CadastroCliente />} />
        <Route
          path="/cadastro-prestador"
          element={
            <AdminRoute>
              <CadastroPrestador />
            </AdminRoute>
          }
        />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="/socorro" element={<Socorro />} />
        <Route path="/pacotes" element={<Pacotes />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPrestadores />
            </AdminRoute>
          }
        />
        <Route path="/perfil" element={<Profile />} />
      </Routes>
     
    </BrowserRouter>
  )
}

export default App
