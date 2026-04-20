import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import EmergencyButton from "../../components/EmergencyButton"
import Mapa from "../../components/Mapa/Mapa"
import PrestadorCard from "../../components/PrestadorCard"
import { useAuth } from "../../providers/AuthProvider"
import { formatarData } from "../../services/storage"
import { listPrestadores } from "../../services/prestadoresService"
import { listFavoritosIds, toggleFavorito } from "../../services/favoritosService"
import { createChamado, listChamados } from "../../services/chamadosService"
import {
  createAvaliacao,
  getResumoAvaliacaoFromList,
  listAvaliacoesByPrestadores
} from "../../services/avaliacoesService"
import "./Home.css"

const TIPOS_SERVICO = [
  { nome: "Guincho", icone: "GUI" },
  { nome: "Bateria", icone: "BAT" },
  { nome: "Borracheiro", icone: "BOR" },
  { nome: "Mecanico", icone: "MEC" },
  { nome: "Auto Eletrica", icone: "ELE" },
  { nome: "Chaveiro", icone: "CHA" },
  { nome: "Ar Condicionado", icone: "AR" },
  { nome: "Troca de Oleo", icone: "OLE" }
]

const LINKS_RAPIDOS = [
  { label: "Favoritos", rota: "/favoritos" },
  { label: "Historico", rota: "/historico" },
  { label: "Pacotes", rota: "/pacotes" },
  { label: "Painel", rota: "/admin" },
  { label: "Perfil", rota: "/perfil" }
]

function normalizarTexto(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function normalizarCategoria(value) {
  const texto = normalizarTexto(String(value || "")).replace(/[^a-z]/g, "")

  if (texto.includes("guin")) return "guincho"
  if (texto.includes("bater")) return "bateria"
  if (texto.includes("borr")) return "borracheiro"
  if (texto.includes("mec")) return "mecanico"
  if (texto.includes("ele")) return "autoeletrica"
  if (texto.includes("chav")) return "chaveiro"
  if (texto.includes("cond")) return "arcondicionado"
  if (texto.includes("ole")) return "trocadeoleo"

  return texto
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
  const [busca, setBusca] = useState("")
  const [local, setLocal] = useState("Sao Paulo - SP")
  const [coords, setCoords] = useState({
    lat: -23.5505,
    lng: -46.6333
  })
  const [avaliacoesPorPrestador, setAvaliacoesPorPrestador] = useState({})
  const [formAvaliacoes, setFormAvaliacoes] = useState({})
  const { user: usuarioAtual, isAdminUser: usuarioAdmin } = useAuth()

  async function carregarDados() {
    const [listaPrestadores, favoritosIds, listaChamados] = await Promise.all([
      listPrestadores(),
      listFavoritosIds(),
      listChamados()
    ])

    setPrestadores(listaPrestadores)
    setFavoritos(favoritosIds)
    setHistorico(listaChamados)
  }

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        const [listaPrestadores, favoritosIds, listaChamados] = await Promise.all([
          listPrestadores(),
          listFavoritosIds(),
          listChamados()
        ])

        if (isMounted) {
          setPrestadores(listaPrestadores)
          setFavoritos(favoritosIds)
          setHistorico(listaChamados)
        }
      } catch (erro) {
        console.error("Erro ao carregar dados:", erro)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [usuarioAtual])

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      const [listaPrestadores, favoritosIds, listaChamados] = await Promise.all([
        listPrestadores(),
        listFavoritosIds(),
        listChamados()
      ])

      if (isMounted) {
        setPrestadores(listaPrestadores)
        setFavoritos(favoritosIds)
        setHistorico(listaChamados)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [usuarioAtual?.id])

  useEffect(() => {
    let isMounted = true

    const loadAvaliacoes = async () => {
      const dados = await listAvaliacoesByPrestadores(prestadores.map((prestador) => prestador.id))
      if (isMounted) {
        setAvaliacoesPorPrestador(dados)
      }
    }

    if (prestadores.length > 0) {
      loadAvaliacoes()
    }

    return () => {
      isMounted = false
    }
  }, [prestadores])

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
      const avaliacoes = avaliacoesPorPrestador[prestador.id] || []
      const resumo = getResumoAvaliacaoFromList(avaliacoes)
      const favorito = favoritos.includes(prestador.id)

      return {
        ...prestador,
        lat,
        lng,
        distancia: calcularDistancia(coords.lat, coords.lng, lat, lng),
        favorito,
        resumoAvaliacao: resumo,
        avaliacoesRecentes: avaliacoes.slice(0, 2)
      }
    })

    if (filtro !== "Todos") {
      lista = lista.filter((prestador) => normalizarCategoria(prestador.tipo) === normalizarCategoria(filtro))
    }

    if (termo) {
      lista = lista.filter((prestador) => {
        const campos = [prestador.nome, prestador.tipo, prestador.cidade, prestador.telefone]
        return campos.some((campo) => normalizarTexto(String(campo)).includes(termo))
      })
    }

    return lista.sort((a, b) => a.distancia - b.distancia)
  }, [avaliacoesPorPrestador, busca, coords, favoritos, filtro, prestadores])

  function selecionar(tipo) {
    setFiltro(filtro === tipo ? "Todos" : tipo)
  }

  async function handleToggleFavorito(prestadorId) {
    try {
      const atualizados = await toggleFavorito(prestadorId)
      setFavoritos(atualizados)
    } catch (error) {
      alert(error.message || "Nao foi possivel atualizar os favoritos.")
    }
  }

  function abrirWhatsapp(prestador, mensagem) {
    window.open(
      `https://wa.me/55${prestador.telefone}?text=${encodeURIComponent(mensagem)}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  async function handleRegistrarChamado(prestador, mensagem = null) {
    try {
      await createChamado(prestador)
      setHistorico(await listChamados())
      abrirWhatsapp(prestador, mensagem || `Ola, preciso de ${prestador.tipo} em ${local}.`)
    } catch (error) {
      alert(error.message || "Nao foi possivel registrar o chamado.")
    }
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

  async function handleEnviarAvaliacao(prestadorId) {
    const form = formAvaliacoes[prestadorId]

    if (!form?.comentario?.trim()) {
      alert("Escreva um comentario para salvar a avaliacao.")
      return
    }

    try {
      const listaAtualizada = await createAvaliacao(prestadorId, form)
      setAvaliacoesPorPrestador((current) => ({
        ...current,
        [prestadorId]: listaAtualizada
      }))
      setFormAvaliacoes((current) => ({
        ...current,
        [prestadorId]: { nota: "5", comentario: "" }
      }))
      alert("Avaliacao registrada com sucesso!")
    } catch (error) {
      alert(error.message || "Nao foi possivel registrar a avaliacao.")
    }
  }

  return (
    <div className="home">
      <div className="header">
        <div className="headerContent">
          <div className="logo">
            <span className="logoIcon">SOS</span>
            <span>
              <span className="sos">SOS</span> Carro
            </span>
          </div>
        </div>
      </div>

      <div className="location">Local atual: {local}</div>

      <div className="welcomePanel">
        <div>
          <strong>{usuarioAtual ? `Ola, ${usuarioAtual.nome}` : "Modo visitante"}</strong>
          <p>
            {usuarioAtual
              ? "Seus favoritos, historico e avaliacoes ficam salvos neste navegador."
              : "Entre ou cadastre-se para separar favoritos e historico por usuario."}
          </p>
        </div>

        <div className="welcomeStats">
          <span>{favoritos.length} favoritos</span>
          <span>{historico.length} chamados</span>
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

        <button onClick={buscarLocal}>Buscar</button>
      </div>

      <EmergencyButton />

      <h3 className="sectionTitle">Servicos Rapidos</h3>

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

      <h3 className="sectionTitle">Profissionais Proximos</h3>

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
              <button onClick={() => navigate("/cadastro-prestador")}>Cadastrar prestador</button>
              <button onClick={() => navigate("/admin")}>Painel administrativo</button>
            </>
          )}
          {!usuarioAdmin && <button onClick={() => navigate("/perfil")}>Ver perfil</button>}
        </div>
      )}

      <div className="bottomMenu">
        <span onClick={() => navigate("/")}>Inicio</span>
        <span onClick={() => navigate("/favoritos")}>Favoritos</span>

        <span className="addButton" onClick={() => setOpenMenu(!openMenu)}>
          +
        </span>

        <span onClick={() => navigate("/historico")}>Chamados</span>
        <span onClick={() => navigate("/perfil")}>Perfil</span>
      </div>
    </div>
  )
}
