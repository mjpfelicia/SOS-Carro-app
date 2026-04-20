import { isSupabaseConfigured, supabase } from "../lib/supabaseClient"
import { getCurrentSessionUser } from "./authService"
import {
  getAvaliacoes as getAvaliacoesLegacy,
  getResumoAvaliacao as getResumoAvaliacaoLegacy,
  registrarAvaliacao as registrarAvaliacaoLegacy
} from "./storage"

async function getAuthenticatedUser() {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  return user
}

function mapAvaliacaoRow(row) {
  return {
    id: row.id,
    usuario: row.usuario_nome || "Usuario",
    nota: Number(row.nota),
    comentario: row.comentario,
    data: row.created_at
  }
}

export function getResumoAvaliacaoFromList(avaliacoes = []) {
  if (avaliacoes.length === 0) {
    return { media: 0, total: 0 }
  }

  const soma = avaliacoes.reduce((acc, item) => acc + Number(item.nota || 0), 0)

  return {
    media: Number((soma / avaliacoes.length).toFixed(1)),
    total: avaliacoes.length
  }
}

export async function listAvaliacoesByPrestador(prestadorId) {
  if (!isSupabaseConfigured) {
    return getAvaliacoesLegacy(prestadorId)
  }

  const { data, error } = await supabase
    .from("avaliacoes")
    .select("id, usuario_nome, nota, comentario, created_at")
    .eq("prestador_id", prestadorId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data.map(mapAvaliacaoRow)
}

export async function listAvaliacoesByPrestadores(prestadorIds = []) {
  if (!prestadorIds.length) {
    return {}
  }

  if (!isSupabaseConfigured) {
    return prestadorIds.reduce((acc, prestadorId) => {
      acc[prestadorId] = getAvaliacoesLegacy(prestadorId)
      return acc
    }, {})
  }

  const { data, error } = await supabase
    .from("avaliacoes")
    .select("id, prestador_id, usuario_nome, nota, comentario, created_at")
    .in("prestador_id", prestadorIds)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data.reduce((acc, row) => {
    const prestadorId = row.prestador_id

    if (!acc[prestadorId]) {
      acc[prestadorId] = []
    }

    acc[prestadorId].push(mapAvaliacaoRow(row))
    return acc
  }, {})
}

export async function createAvaliacao(prestadorId, avaliacao) {
  if (!isSupabaseConfigured) {
    registrarAvaliacaoLegacy(prestadorId, avaliacao)
    return listAvaliacoesByPrestador(prestadorId)
  }

  const user = await getAuthenticatedUser()
  const usuarioAtual = await getCurrentSessionUser()

  if (!user) {
    throw new Error("Entre na sua conta para avaliar prestadores.")
  }

  const { error } = await supabase.from("avaliacoes").insert({
    user_id: user.id,
    prestador_id: prestadorId,
    usuario_nome: usuarioAtual?.nome || "Usuario",
    nota: Number(avaliacao.nota),
    comentario: avaliacao.comentario
  })

  if (error) {
    throw new Error(error.message)
  }

  return listAvaliacoesByPrestador(prestadorId)
}

export async function getResumoAvaliacao(prestadorId) {
  if (!isSupabaseConfigured) {
    return getResumoAvaliacaoLegacy(prestadorId)
  }

  const avaliacoes = await listAvaliacoesByPrestador(prestadorId)
  return getResumoAvaliacaoFromList(avaliacoes)
}
