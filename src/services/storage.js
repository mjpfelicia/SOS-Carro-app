const KEYS = {
  prestadores: "prestadores",
  usuarios: "usuarios",
  usuarioAtual: "usuarioAtual",
  favoritosPorUsuario: "favoritosPorUsuario",
  chamadosPorUsuario: "chamadosPorUsuario",
  avaliacoesPorPrestador: "avaliacoesPorPrestador"
}

const ADMIN_PADRAO = {
  id: "usuario-admin-sos-carro",
  nome: "Administrador SOS Carro",
  email: "admin@soscarro.com",
  senha: "admin123",
  role: "admin"
}

const PRESTADORES_INICIAIS = [
  {
    id: "prestador-mecanico-centro",
    nome: "Marcos Auto Socorro",
    telefone: "11987654321",
    tipo: "Mecânico",
    cidade: "São Paulo"
  },
  {
    id: "prestador-guincho-zona-sul",
    nome: "Guincho Prime",
    telefone: "11999887766",
    tipo: "Guincho",
    cidade: "São Paulo"
  },
  {
    id: "prestador-borracharia-leste",
    nome: "Borracharia do Paulo",
    telefone: "11991234567",
    tipo: "Borracheiro",
    cidade: "Santo André"
  }
]

function createPrestadorId(data, index = Date.now()) {
  return `prestador-${slugify(`${data.nome}-${data.tipo}-${data.cidade}`)}-${index}`
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function ensurePrestadoresSeed() {
  const current = read(KEYS.prestadores, null)

  if (!current || current.length === 0) {
    write(KEYS.prestadores, PRESTADORES_INICIAIS)
    return
  }

  const normalizados = current.map((prestador, index) => ({
    ...prestador,
    id: prestador.id || createPrestadorId(prestador, index)
  }))

  write(KEYS.prestadores, normalizados)
}

export function getPrestadores() {
  ensurePrestadoresSeed()
  return read(KEYS.prestadores, [])
}

export function savePrestadores(prestadores) {
  write(KEYS.prestadores, prestadores)
}

export function createPrestador(data) {
  const prestadores = getPrestadores()

  const novoPrestador = {
    id: createPrestadorId(data),
    nome: data.nome,
    telefone: data.telefone,
    tipo: data.tipo,
    cidade: data.cidade
  }

  savePrestadores([...prestadores, novoPrestador])
  return novoPrestador
}

export function updatePrestador(prestadorId, updates) {
  const atualizados = getPrestadores().map((prestador) =>
    prestador.id === prestadorId ? { ...prestador, ...updates } : prestador
  )

  savePrestadores(atualizados)
}

export function removePrestador(prestadorId) {
  const filtrados = getPrestadores().filter((prestador) => prestador.id !== prestadorId)
  savePrestadores(filtrados)

  const favoritos = read(KEYS.favoritosPorUsuario, {})
  const historico = read(KEYS.chamadosPorUsuario, {})
  const avaliacoes = read(KEYS.avaliacoesPorPrestador, {})

  Object.keys(favoritos).forEach((userId) => {
    favoritos[userId] = (favoritos[userId] || []).filter((id) => id !== prestadorId)
  })

  Object.keys(historico).forEach((userId) => {
    historico[userId] = (historico[userId] || []).filter((chamado) => chamado.prestadorId !== prestadorId)
  })

  delete avaliacoes[prestadorId]

  write(KEYS.favoritosPorUsuario, favoritos)
  write(KEYS.chamadosPorUsuario, historico)
  write(KEYS.avaliacoesPorPrestador, avaliacoes)
}

export function getUsuarios() {
  const usuarios = read(KEYS.usuarios, [])

  if (!usuarios.some((usuario) => usuario.email === ADMIN_PADRAO.email)) {
    const atualizados = [...usuarios, ADMIN_PADRAO]
    write(KEYS.usuarios, atualizados)
    return atualizados
  }

  return usuarios.map((usuario) => ({
    ...usuario,
    role: usuario.role || (usuario.email === ADMIN_PADRAO.email ? "admin" : "cliente")
  }))
}

export function createUsuario(data) {
  const usuarios = getUsuarios()
  const novoUsuario = {
    id: `usuario-${slugify(data.email)}-${Date.now()}`,
    nome: data.nome,
    email: data.email,
    senha: data.senha,
    role: "cliente"
  }

  write(KEYS.usuarios, [...usuarios, novoUsuario])
  setUsuarioAtual(novoUsuario)
  return novoUsuario
}

export function autenticarUsuario(email, senha) {
  const usuario = getUsuarios().find((item) => item.email === email && item.senha === senha)

  if (!usuario) {
    return null
  }

  setUsuarioAtual(usuario)
  return usuario
}

export function setUsuarioAtual(usuario) {
  write(KEYS.usuarioAtual, usuario)
}

export function getUsuarioAtual() {
  const usuario = read(KEYS.usuarioAtual, null)

  if (!usuario) {
    return null
  }

  return {
    ...usuario,
    role: usuario.role || (usuario.email === ADMIN_PADRAO.email ? "admin" : "cliente")
  }
}

export function logoutUsuario() {
  localStorage.removeItem(KEYS.usuarioAtual)
}

function getUserKey() {
  const usuario = getUsuarioAtual()
  return usuario?.id || "visitante"
}

export function getFavoritos() {
  const favoritosPorUsuario = read(KEYS.favoritosPorUsuario, {})
  return favoritosPorUsuario[getUserKey()] || []
}

export function toggleFavorito(prestadorId) {
  const favoritosPorUsuario = read(KEYS.favoritosPorUsuario, {})
  const userKey = getUserKey()
  const lista = favoritosPorUsuario[userKey] || []

  favoritosPorUsuario[userKey] = lista.includes(prestadorId)
    ? lista.filter((id) => id !== prestadorId)
    : [...lista, prestadorId]

  write(KEYS.favoritosPorUsuario, favoritosPorUsuario)
  return favoritosPorUsuario[userKey]
}

export function isFavorito(prestadorId) {
  return getFavoritos().includes(prestadorId)
}

export function registrarChamado(prestador) {
  const prioridade = prestador.prioridade || "normal"
  const historicoPorUsuario = read(KEYS.chamadosPorUsuario, {})
  const userKey = getUserKey()
  const lista = historicoPorUsuario[userKey] || []

  const chamado = {
    id: `chamado-${Date.now()}`,
    prestadorId: prestador.id,
    nomePrestador: prestador.nome,
    tipo: prestador.tipo,
    cidade: prestador.cidade,
    telefone: prestador.telefone,
    data: new Date().toISOString(),
    status: "Solicitado",
    prioridade
  }

  historicoPorUsuario[userKey] = [chamado, ...lista]
  write(KEYS.chamadosPorUsuario, historicoPorUsuario)
  return chamado
}

export function getChamados() {
  const historicoPorUsuario = read(KEYS.chamadosPorUsuario, {})
  return historicoPorUsuario[getUserKey()] || []
}

export function registrarAvaliacao(prestadorId, avaliacao) {
  const avaliacoesPorPrestador = read(KEYS.avaliacoesPorPrestador, {})
  const usuario = getUsuarioAtual()
  const lista = avaliacoesPorPrestador[prestadorId] || []

  lista.unshift({
    id: `avaliacao-${Date.now()}`,
    usuario: usuario?.nome || "Visitante",
    nota: Number(avaliacao.nota),
    comentario: avaliacao.comentario,
    data: new Date().toISOString()
  })

  avaliacoesPorPrestador[prestadorId] = lista
  write(KEYS.avaliacoesPorPrestador, avaliacoesPorPrestador)
}

export function getAvaliacoes(prestadorId) {
  const avaliacoesPorPrestador = read(KEYS.avaliacoesPorPrestador, {})
  return avaliacoesPorPrestador[prestadorId] || []
}

export function getResumoAvaliacao(prestadorId) {
  const avaliacoes = getAvaliacoes(prestadorId)

  if (avaliacoes.length === 0) {
    return { media: 0, total: 0 }
  }

  const soma = avaliacoes.reduce((acc, item) => acc + item.nota, 0)
  return {
    media: Number((soma / avaliacoes.length).toFixed(1)),
    total: avaliacoes.length
  }
}

export function formatarData(dateString) {
  return new Date(dateString).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

export function isAdmin(usuario = getUsuarioAtual()) {
  return usuario?.role === "admin"
}
