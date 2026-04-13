const KEYS = {
  prestadores: "prestadores",
  usuarios: "usuarios",
  usuarioAtual: "usuarioAtual",
  favoritosPorUsuario: "favoritosPorUsuario",
  chamadosPorUsuario: "chamadosPorUsuario",
  avaliacoesPorPrestador: "avaliacoesPorPrestador",
  pacotes: "pacotes",
  assinaturasPorUsuario: "assinaturasPorUsuario"
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

const PACOTES_INICIAIS = [
  {
    id: "pacote-basico",
    nome: "Pacote Básico",
    preco: 29.90,
    periodo: "mensal",
    descricao: "3 chamados de emergência por mês com valores fixos",
    beneficios: [
      "3 chamados de socorro gratuitos",
      "Prioridade alta nos atendimentos",
      "Desconto de 20% em serviços adicionais"
    ],
    maxChamados: 3
  },
  {
    id: "pacote-premium",
    nome: "Pacote Premium",
    preco: 49.90,
    periodo: "mensal",
    descricao: "Chamados ilimitados com valores fixos e benefícios exclusivos",
    beneficios: [
      "Chamados ilimitados",
      "Prioridade máxima",
      "Desconto de 30% em todos os serviços",
      "Suporte 24/7 por telefone"
    ],
    maxChamados: -1 // ilimitado
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

  // Verificar se o email já está em uso
  const emailExistente = usuarios.find((u) => u.email === data.email)
  if (emailExistente) {
    throw new Error("Este email já está cadastrado")
  }

  const novoUsuario = {
    id: `usuario-${slugify(data.email)}-${Date.now()}`,
    nome: data.nome,
    email: data.email,
    telefone: data.telefone || "",
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

export function updateUsuario(data) {
  const usuarios = getUsuarios()
  const usuarioAtual = getUsuarioAtual()

  if (!usuarioAtual) {
    throw new Error("Nenhum usuário autenticado")
  }

  // Verificar se o email já está em uso por outro usuário
  if (data.email && data.email !== usuarioAtual.email) {
    const emailExistente = usuarios.find((u) => u.email === data.email && u.id !== usuarioAtual.id)
    if (emailExistente) {
      throw new Error("Este email já está em uso por outro usuário")
    }
  }

  const index = usuarios.findIndex((u) => u.id === usuarioAtual.id)

  if (index === -1) {
    throw new Error("Usuário não encontrado")
  }

  const usuarioAtualizado = {
    ...usuarios[index],
    ...data
  }

  usuarios[index] = usuarioAtualizado
  write(KEYS.usuarios, usuarios)
  setUsuarioAtual(usuarioAtualizado)

  return usuarioAtualizado
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

export function registrarChamado(prestador, contexto = {}) {
  const prioridade = contexto.prioridade || prestador.prioridade || "normal"
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
    prioridade,
    problema: contexto.problema || null,
    detalhes: contexto.detalhes || null,
    localizacao: contexto.localizacao || null
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

export function getPacotes() {
  return read(KEYS.pacotes, PACOTES_INICIAIS)
}

export function assinarPacote(pacoteId) {
  const usuario = getUsuarioAtual()
  if (!usuario) throw new Error("Usuário não autenticado")

  const pacotes = getPacotes()
  const pacote = pacotes.find(p => p.id === pacoteId)
  if (!pacote) throw new Error("Pacote não encontrado")

  const assinaturas = read(KEYS.assinaturasPorUsuario, {})
  const userKey = usuario.id

  const agora = new Date()
  const assinatura = {
    pacoteId,
    dataInicio: agora.toISOString(),
    dataFim: new Date(agora.getFullYear(), agora.getMonth() + 1, agora.getDate()).toISOString(),
    status: "ativo",
    chamadosUsados: 0
  }

  assinaturas[userKey] = assinatura
  write(KEYS.assinaturasPorUsuario, assinaturas)
  return assinatura
}

export function getAssinaturaAtual() {
  const usuario = getUsuarioAtual()
  if (!usuario) return null

  const assinaturas = read(KEYS.assinaturasPorUsuario, {})
  const assinatura = assinaturas[usuario.id]
  if (!assinatura) return null

  const agora = new Date()
  const dataFim = new Date(assinatura.dataFim)
  if (agora > dataFim) {
    assinatura.status = "expirado"
    write(KEYS.assinaturasPorUsuario, assinaturas)
  }

  return assinatura
}

export function podeUsarChamado() {
  const assinatura = getAssinaturaAtual()
  if (!assinatura || assinatura.status !== "ativo") return false

  const pacote = getPacotes().find(p => p.id === assinatura.pacoteId)
  if (!pacote) return false

  if (pacote.maxChamados === -1) return true // ilimitado
  return assinatura.chamadosUsados < pacote.maxChamados
}

export function registrarUsoChamado() {
  const usuario = getUsuarioAtual()
  if (!usuario) return

  const assinaturas = read(KEYS.assinaturasPorUsuario, {})
  const assinatura = assinaturas[usuario.id]
  if (assinatura && assinatura.status === "ativo") {
    assinatura.chamadosUsados += 1
    write(KEYS.assinaturasPorUsuario, assinaturas)
  }
}
