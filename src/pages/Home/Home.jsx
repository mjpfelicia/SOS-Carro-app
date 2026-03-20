import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Mapa from "../../components/Mapa/Mapa"
import "./Home.css"

export default function Home() {

  const [openMenu, setOpenMenu] = useState(false)
  const [filtro, setFiltro] = useState("Todos")
  const [prestadores, setPrestadores] = useState([])

  const [busca, setBusca] = useState("")
  const [local, setLocal] = useState("São Paulo - SP")

  const [coords, setCoords] = useState({
    lat: -23.5505,
    lng: -46.6333
  })

  const navigate = useNavigate()

  // carregar prestadores
  useEffect(() => {
    const lista = JSON.parse(localStorage.getItem("prestadores")) || []
    setPrestadores(lista)
  }, [])

  // GPS
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        })
      },
      () => {
        console.log("GPS não permitido")
      }
    )
  }, [])

  // calcular distância
  function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return (R * c).toFixed(1)
  }

  // 🔍 buscar cidade (SÓ botão agora)
  async function buscarLocal() {

    if (!busca) return

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${busca}`
      )

      const data = await res.json()

      if (data.length > 0) {
        const lugar = data[0]

        const cidade =
          lugar.address.city ||
          lugar.address.town ||
          lugar.address.village ||
          "Local"

        const estado = lugar.address.state || ""

        setLocal(`${cidade} - ${estado}`)

        setCoords({
          lat: parseFloat(lugar.lat),
          lng: parseFloat(lugar.lon)
        })

      } else {
        alert("Local não encontrado")
      }

    } catch (err) {
      console.log(err)
    }
  }

  // filtro base
  let listaFiltrada = filtro === "Todos"
    ? prestadores
    : prestadores.filter(p => p.tipo === filtro)

  // 🔥 filtro por texto (AGORA FUNCIONA)
  listaFiltrada = listaFiltrada.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.tipo.toLowerCase().includes(busca.toLowerCase()) ||
    p.cidade.toLowerCase().includes(busca.toLowerCase())
  )

  // adicionar distância fake + ordenar
  listaFiltrada = listaFiltrada.map(p => {

    const lat = coords.lat + (Math.random() * 0.02)
    const lng = coords.lng + (Math.random() * 0.02)

    return {
      ...p,
      lat,
      lng,
      distancia: calcularDistancia(coords.lat, coords.lng, lat, lng)
    }

  }).sort((a, b) => a.distancia - b.distancia)

  function selecionar(tipo) {
    setFiltro(filtro === tipo ? "Todos" : tipo)
  }

  return (
    <div className="home">

      {/* HEADER */}
      <div className="header">
        <div className="headerContent">
          <div className="logo">
            <span className="sos">🚗 SOS</span> Carro
          </div>
        </div>
      </div>

      {/* LOCAL */}
      <div className="location">
        📍 {local}
      </div>

      {/* 🔍 BUSCA CORRIGIDA */}
      <div className="searchBox">
        <input
          placeholder="Buscar serviço ou nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        <button onClick={buscarLocal}>
          🔍
        </button>
      </div>

      {/* SERVIÇOS */}
      <h3 className="sectionTitle">Serviços Rápidos</h3>

      <div className="services">
        {["Mecânico", "Borracheiro", "Bateria", "Guincho", "Chaveiro", "Ar Condicionado", "Troca de Óleo", "Auto Elétrica"].map((tipo, i) => (
          <div
            key={i}
            className={`service ${filtro === tipo ? "active" : ""}`}
            onClick={() => selecionar(tipo)}
          >
            {tipo === "Mecânico" && "🔧"}
            {tipo === "Borracheiro" && "🛞"}
            {tipo === "Bateria" && "🔋"}
            {tipo === "Guincho" && "🚗"}
            {tipo === "Chaveiro" && "🗝️"}
            {tipo === "Ar Condicionado" && "❄️"}
            {tipo === "Troca de Óleo" && "🛢️"}
            {tipo === "Auto Elétrica" && "🔌"}

            <span>{tipo}</span>
          </div>
        ))}
      </div>

      {/* PROFISSIONAIS */}
      <h3 className="sectionTitle">Profissionais Próximos</h3>

      <div className="professionals">
        {listaFiltrada.length === 0 ? (
          <p style={{ padding: "10px" }}>
            Nenhum prestador encontrado
          </p>
        ) : (
          listaFiltrada.map((p, i) => (
            <div key={i} className="card">
              <img src={`https://randomuser.me/api/portraits/men/${i + 10}.jpg`} />

              <div className="cardInfo">
                <h4>{p.nome}</h4>

                <p>
                  {p.tipo} • {p.cidade} • {p.distancia} km
                </p>

                <a
                  href={`https://wa.me/55${p.telefone}?text=Olá, preciso de ${p.tipo} em ${local}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btnWhatsClean"
                >
                  💬 Chamar
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* BOTÃO */}
      <button className="emergency">
        🚨 SOCORRO AUTOMOTIVO
      </button>

      {/* MAPA */}
      <div className="mapa">
        <Mapa prestadores={listaFiltrada} center={coords} />
      </div>

      {/* MENU */}
      {openMenu && (
        <div className="popupMenu">
          <button onClick={() => navigate("/cadastro-prestador")}>
            Cadastrar prestador
          </button>
        </div>
      )}

      <div className="bottomMenu">
        <span onClick={() => navigate("/")}>🏠</span>
        <span onClick={() => navigate("/favoritos")}>❤️</span>

        <span
          className="addButton"
          onClick={() => setOpenMenu(!openMenu)}
        >
          ➕
        </span>

        <span onClick={() => navigate("/login")}>👤</span>
      </div>

    </div>
  )
}