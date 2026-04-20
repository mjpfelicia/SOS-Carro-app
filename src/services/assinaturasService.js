import { isSupabaseConfigured, supabase } from "../lib/supabaseClient"
import {
  assinarPacote as assinarPacoteLegacy,
  getAssinaturaAtual as getAssinaturaAtualLegacy,
  getPacotes as getPacotesLegacy,
  podeUsarChamado as podeUsarChamadoLegacy,
  registrarUsoChamado as registrarUsoChamadoLegacy
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

function enrichPacotes(pacotes) {
  const legacyPacotes = getPacotesLegacy()

  return pacotes.map((pacote) => {
    const legacy = legacyPacotes.find((item) => item.id === pacote.id)

    return {
      ...legacy,
      ...pacote,
      beneficios: legacy?.beneficios || []
    }
  })
}

function normalizeAssinatura(assinatura) {
  if (!assinatura) {
    return null
  }

  return {
    pacoteId: assinatura.pacote_id || assinatura.pacoteId,
    dataInicio: assinatura.data_inicio || assinatura.dataInicio,
    dataFim: assinatura.data_fim || assinatura.dataFim,
    status: assinatura.status,
    chamadosUsados: assinatura.chamados_usados ?? assinatura.chamadosUsados ?? 0
  }
}

export async function listPacotes() {
  if (!isSupabaseConfigured) {
    return getPacotesLegacy()
  }

  const { data, error } = await supabase
    .from("pacotes")
    .select("id, nome, preco, periodo, descricao, max_chamados")
    .order("preco", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return enrichPacotes(
    data.map((pacote) => ({
      ...pacote,
      maxChamados: pacote.max_chamados
    }))
  )
}

export async function getAssinaturaAtual() {
  if (!isSupabaseConfigured) {
    return getAssinaturaAtualLegacy()
  }

  const user = await getAuthenticatedUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from("assinaturas")
    .select("id, pacote_id, data_inicio, data_fim, status, chamados_usados")
    .eq("user_id", user.id)
    .order("data_inicio", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    return null
  }

  const agora = new Date()
  const dataFim = new Date(data.data_fim)

  if (agora > dataFim && data.status !== "expirado") {
    const { error: updateError } = await supabase
      .from("assinaturas")
      .update({ status: "expirado" })
      .eq("id", data.id)

    if (updateError) {
      throw new Error(updateError.message)
    }

    return normalizeAssinatura({ ...data, status: "expirado" })
  }

  return normalizeAssinatura(data)
}

export async function assinarPacote(pacoteId) {
  if (!isSupabaseConfigured) {
    return assinarPacoteLegacy(pacoteId)
  }

  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Usuario nao autenticado")
  }

  const pacotes = await listPacotes()
  const pacote = pacotes.find((item) => item.id === pacoteId)

  if (!pacote) {
    throw new Error("Pacote nao encontrado")
  }

  const agora = new Date()
  const dataFim = new Date(agora.getFullYear(), agora.getMonth() + 1, agora.getDate())

  const assinaturaAtual = await getAssinaturaAtual()

  if (assinaturaAtual?.status === "ativo") {
    const { error: expireError } = await supabase
      .from("assinaturas")
      .update({ status: "cancelado" })
      .eq("user_id", user.id)
      .eq("status", "ativo")

    if (expireError) {
      throw new Error(expireError.message)
    }
  }

  const { data, error } = await supabase
    .from("assinaturas")
    .insert({
      user_id: user.id,
      pacote_id: pacoteId,
      data_inicio: agora.toISOString(),
      data_fim: dataFim.toISOString(),
      status: "ativo",
      chamados_usados: 0
    })
    .select("pacote_id, data_inicio, data_fim, status, chamados_usados")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return normalizeAssinatura(data)
}

export async function podeUsarChamado() {
  if (!isSupabaseConfigured) {
    return podeUsarChamadoLegacy()
  }

  const assinatura = await getAssinaturaAtual()

  if (!assinatura || assinatura.status !== "ativo") {
    return false
  }

  const pacotes = await listPacotes()
  const pacote = pacotes.find((item) => item.id === assinatura.pacoteId)

  if (!pacote) {
    return false
  }

  if (pacote.maxChamados === -1) {
    return true
  }

  return assinatura.chamadosUsados < pacote.maxChamados
}

export async function registrarUsoChamado() {
  if (!isSupabaseConfigured) {
    registrarUsoChamadoLegacy()
    return
  }

  const user = await getAuthenticatedUser()

  if (!user) {
    return
  }

  const assinatura = await getAssinaturaAtual()

  if (!assinatura || assinatura.status !== "ativo") {
    return
  }

  const { error } = await supabase
    .from("assinaturas")
    .update({ chamados_usados: assinatura.chamadosUsados + 1 })
    .eq("user_id", user.id)
    .eq("status", "ativo")

  if (error) {
    throw new Error(error.message)
  }
}
