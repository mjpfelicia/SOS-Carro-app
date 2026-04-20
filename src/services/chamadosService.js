import { isSupabaseConfigured, supabase } from "../lib/supabaseClient"
import {
  getChamados as getChamadosLegacy,
  registrarChamado as registrarChamadoLegacy
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

function mapChamadoRow(row) {
  return {
    id: row.id,
    prestadorId: row.prestador_id,
    nomePrestador: row.prestadores?.nome || "Prestador",
    tipo: row.prestadores?.tipo || "",
    cidade: row.prestadores?.cidade || "",
    telefone: row.prestadores?.telefone || "",
    data: row.created_at,
    status: row.status,
    prioridade: row.prioridade,
    problema: row.problema,
    detalhes: row.detalhes,
    localizacao: row.localizacao
  }
}

export async function listChamados() {
  if (!isSupabaseConfigured) {
    return getChamadosLegacy()
  }

  const user = await getAuthenticatedUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from("chamados")
    .select(
      "id, prestador_id, problema, detalhes, localizacao, prioridade, status, created_at, prestadores(nome, tipo, cidade, telefone)"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data.map(mapChamadoRow)
}

export async function createChamado(prestador, contexto = {}) {
  if (!isSupabaseConfigured) {
    return registrarChamadoLegacy(prestador, contexto)
  }

  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Entre na sua conta para registrar chamados.")
  }

  const { data, error } = await supabase
    .from("chamados")
    .insert({
      user_id: user.id,
      prestador_id: prestador.id,
      problema: contexto.problema || null,
      detalhes: contexto.detalhes || null,
      localizacao: contexto.localizacao || null,
      prioridade: contexto.prioridade || prestador.prioridade || "normal",
      status: "Solicitado"
    })
    .select(
      "id, prestador_id, problema, detalhes, localizacao, prioridade, status, created_at, prestadores(nome, tipo, cidade, telefone)"
    )
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapChamadoRow(data)
}

