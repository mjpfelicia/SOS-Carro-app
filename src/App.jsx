import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom"
import { useEffect } from "react"
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

function RedirectHandler() {
  const navigate = useNavigate()

  useEffect(() => {
    // Handle GitHub Pages SPA redirects
    const urlParams = new URLSearchParams(window.location.search)
    const redirect = urlParams.get('/')

    if (redirect) {
      // Decode the path and navigate to it
      const path = '/' + redirect.replace(/~and~/g, '&')
      navigate(path, { replace: true })
    }
  }, [navigate])

  return null
}

function App() {
  return (
    <BrowserRouter basename="/sos-carro-app">
      <RedirectHandler />
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
