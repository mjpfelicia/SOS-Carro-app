import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import EmergencyButton from "../../components/EmergencyButton"
import Mapa from "../../components/Mapa/Mapa"
import PrestadorCard from "../../components/PrestadorCard"
import {
  formatarData,
  getAvaliacoes,
  getChamados,
  getFavoritos,
  getPrestadores,
  getResumoAvaliacao,
  getUsuarioAtual,
  isAdmin,
  registrarAvaliacao,
  registrarChamado,
  toggleFavorito
} from "../../services/storage"
import "./Home.css"

const TIPOS_SERVICO = [
  { nome: "Guincho", icone: "🚚" },
  { nome: "Bateria", icone: "🔋" },
  { nome: "Borracheiro", icone: "🛞" },
  { nome: "Mecânico", icone: "🔧" },
  { nome: "Auto Elétrica", icone: "⚡" },
  { nome: "Chaveiro", icone: "🗝️" },
  { nome: "Ar Condicionado", icone: "❄️" },
  { nome: "Troca de Óleo", icone: "🛢️" }
]

const LINKS_RAPIDOS = [
  { label: "❤️ Favoritos", rota: "/favoritos" },
  { label: "🧾 Histórico", rota: "/historico" },
  { label: "� Pacotes", rota: "/pacotes" },
  { label: "�🛠️ Painel", rota: "/admin" },
  { label: "👤 Perfil", rota: "/perfil" }
]

function normalizarTexto(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function gerarOffset(seed, divisor) {
  const texto = String(seed)
  let total = 0

  for (let i = 0; i < texto.length; i += 1) {
    total += texto.charCodeAt(i) * (i + 1)
  }

  return ((total % divisor) - divisor / 2) / 1000
}

export default function Home() {
  const navigate = useNavigate()
  const [openMenu, setOpenMenu] = useState(false)
  const [filtro, setFiltro] = useState("Todos")
  const [prestadores, setPrestadores] = useState([])
  const [favoritos, setFavoritos] = useState([])
  const [historico, setHistorico] = useState([])
  const [usuarioAtual, setUsuarioAtual] = useState(null)
  const [busca, setBusca] = useState("")
  const [local, setLocal] = useState("Sao Paulo - SP")
  const [coords, setCoords] = useState({
    lat: -23.5505,
    lng: -46.6333
  })
  const [avaliacoes, setAvaliacoes] = useState({})
  const [formAvaliacoes, setFormAvaliacoes] = useState({})
  const usuarioAdmin = isAdmin(usuarioAtual)

  function carregarDados() {
    setPrestadores(getPrestadores())
    setFavoritos(getFavoritos())
    setHistorico(getChamados())
    setUsuarioAtual(getUsuarioAtual())
  }

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        })
      },
      () => {
        console.log("GPS nao permitido")
      }
    )
  }, [])

  function calcularDistancia(lat1, lon1, lat2, lon2) {
    const raio = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Number((raio * c).toFixed(1))
  }

  async function buscarLocal() {
    if (!busca.trim()) return

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(busca)}`
      )

      const data = await res.json()

      if (data.length === 0) {
        alert("Local nao encontrado")
        return
      }

      const lugar = data[0]
      const cidade =
        lugar.address.city || lugar.address.town || lugar.address.village || "Local"
      const estado = lugar.address.state || ""

      setLocal(`${cidade} - ${estado}`)
      setCoords({
        lat: parseFloat(lugar.lat),
        lng: parseFloat(lugar.lon)
      })
    } catch (err) {
      console.log(err)
      alert("Nao foi possivel buscar esse local agora.")
    }
  }

  const prestadoresComContexto = useMemo(() => {
    const termo = normalizarTexto(busca)

    let lista = prestadores.map((prestador, index) => {
      const lat = coords.lat + gerarOffset(prestador.id || index, 40)
      const lng = coords.lng + gerarOffset((prestador.id || index) + "lng", 50)
      const resumo = getResumoAvaliacao(prestador.id)
      const favorito = favoritos.includes(prestador.id)

      return {
        ...prestador,
        lat,
        lng,
        distancia: calcularDistancia(coords.lat, coords.lng, lat, lng),
        favorito,
        resumoAvaliacao: resumo,
        avaliacoesRecentes: getAvaliacoes(prestador.id).slice(0, 2)
      }
    })

    if (filtro !== "Todos") {
      lista = lista.filter((prestador) => normalizarTexto(prestador.tipo) === normalizarTexto(filtro))
    }

    if (termo) {
      lista = lista.filter((prestador) => {
        const campos = [prestador.nome, prestador.tipo, prestador.cidade, prestador.telefone]
        return campos.some((campo) => normalizarTexto(String(campo)).includes(termo))
      })
    }

    return lista.sort((a, b) => a.distancia - b.distancia)
  }, [avaliacoes, busca, coords, favoritos, filtro, prestadores])

  function selecionar(tipo) {
    setFiltro(filtro === tipo ? "Todos" : tipo)
  }

  function handleToggleFavorito(prestadorId) {
    const atualizados = toggleFavorito(prestadorId)
    setFavoritos(atualizados)
  }

  function abrirWhatsapp(prestador, mensagem) {
    window.open(
      `https://wa.me/55${prestador.telefone}?text=${encodeURIComponent(mensagem)}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  function handleRegistrarChamado(prestador, mensagem = null) {
    registrarChamado(prestador)
    setHistorico(getChamados())
    abrirWhatsapp(prestador, mensagem || `Ola, preciso de ${prestador.tipo} em ${local}.`)
  }

  function handleFormAvaliacao(prestadorId, campo, valor) {
    setFormAvaliacoes((current) => ({
      ...current,
      [prestadorId]: {
        nota: current[prestadorId]?.nota || "5",
        comentario: current[prestadorId]?.comentario || "",
        [campo]: valor
      }
    }))
  }

  function handleEnviarAvaliacao(prestadorId) {
    const form = formAvaliacoes[prestadorId]

    if (!form?.comentario?.trim()) {
      alert("Escreva um comentario para salvar a avaliacao.")
      return
    }

    registrarAvaliacao(prestadorId, form)
    setAvaliacoes((current) => ({ ...current, [prestadorId]: Date.now() }))
    setFormAvaliacoes((current) => ({
      ...current,
      [prestadorId]: { nota: "5", comentario: "" }
    }))
    alert("Avaliacao registrada com sucesso!")
  }

  return (
    <div className="home">
      <div className="header">
        <div className="headerContent">
          <div className="logo">
            <span className="logoIcon">🚗</span>
            <span>
              <span className="sos">SOS</span> Carro
            </span>
          </div>
        </div>
      </div>

      <div className="location">📍 Local atual: {local}</div>

      <div className="welcomePanel">
        <div>
          <strong>{usuarioAtual ? `👋 Ola, ${usuarioAtual.nome}` : "👀 Modo visitante"}</strong>
          <p>
            {usuarioAtual
              ? "Seus favoritos, historico e avaliacoes ficam salvos neste navegador."
              : "Entre ou cadastre-se para separar favoritos e historico por usuario."}
          </p>
        </div>

        <div className="welcomeStats">
          <span>❤️ {favoritos.length} favoritos</span>
          <span>🧾 {historico.length} chamados</span>
        </div>
      </div>

      <div className="quickLinks">
        {LINKS_RAPIDOS.filter((link) => usuarioAdmin || link.rota !== "/admin").map((link) => (
          <button key={link.rota} onClick={() => navigate(link.rota)}>
            <span>{link.label}</span>
          </button>
        ))}
      </div>

      <div className="searchBox">
        <input
          placeholder="Buscar servico, nome, cidade ou local..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        <button onClick={buscarLocal}>🔎 Buscar</button>
      </div>

      <EmergencyButton />

      <h3 className="sectionTitle">⚡ Servicos Rapidos</h3>

      <div className="services">
        {TIPOS_SERVICO.map((tipo) => (
          <div
            key={tipo.nome}
            className={`service ${filtro === tipo.nome ? "active" : ""}`}
            onClick={() => selecionar(tipo.nome)}
          >
            <span className="serviceIcon">{tipo.icone}</span>
            <span>{tipo.nome}</span>
          </div>
        ))}
      </div>

      <h3 className="sectionTitle">📍 Profissionais Proximos</h3>

      <div className="professionalsGrid">
        {prestadoresComContexto.length === 0 ? (
          <p className="emptyState">Nenhum prestador encontrado.</p>
        ) : (
          prestadoresComContexto.map((prestador, index) => (
            <PrestadorCard
              key={prestador.id}
              prestador={prestador}
              index={index}
              local={local}
              formAvaliacao={formAvaliacoes[prestador.id]}
              onToggleFavorito={handleToggleFavorito}
              onRegistrarChamado={handleRegistrarChamado}
              onFormAvaliacao={handleFormAvaliacao}
              onEnviarAvaliacao={handleEnviarAvaliacao}
              formatarData={formatarData}
            />
          ))
        )}
      </div>

      <div className="mapa">
        <Mapa prestadores={prestadoresComContexto} center={coords} />
      </div>

      {openMenu && (
        <div className="popupMenu">
          {usuarioAdmin && (
            <>
              <button onClick={() => navigate("/cadastro-prestador")}>➕ Cadastrar prestador</button>
              <button onClick={() => navigate("/admin")}>🛠️ Painel administrativo</button>
            </>
          )}
          {!usuarioAdmin && <button onClick={() => navigate("/perfil")}>👤 Ver perfil</button>}
        </div>
      )}

      <div className="bottomMenu">
        <span onClick={() => navigate("/")}>🏠 Inicio</span>
        <span onClick={() => navigate("/favoritos")}>❤️ Favoritos</span>

        <span className="addButton" onClick={() => setOpenMenu(!openMenu)}>
          +
        </span>

        <span onClick={() => navigate("/historico")}>🧾 Chamados</span>
        <span onClick={() => navigate("/perfil")}>👤 Perfil</span>
      </div>
    </div>
  )
}
