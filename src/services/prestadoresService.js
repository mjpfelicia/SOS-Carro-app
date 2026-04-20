import { isSupabaseConfigured, supabase } from "../lib/supabaseClient"
import {
  createPrestador as createPrestadorLegacy,
  getPrestadores as getPrestadoresLegacy,
  removePrestador as removePrestadorLegacy,
  updatePrestador as updatePrestadorLegacy
} from "./storage"

export async function listPrestadores() {
  if (!isSupabaseConfigured) {
    return getPrestadoresLegacy()
  }

  const { data, error } = await supabase
    .from("prestadores")
    .select("id, nome, telefone, tipo, cidade, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function createPrestador(data) {
  if (!isSupabaseConfigured) {
    return createPrestadorLegacy(data)
  }

  const { data: created, error } = await supabase
    .from("prestadores")
    .insert({
      nome: data.nome,
      telefone: data.telefone,
      tipo: data.tipo,
      cidade: data.cidade
    })
    .select("id, nome, telefone, tipo, cidade, created_at")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return created
}

export async function updatePrestador(prestadorId, updates) {
  if (!isSupabaseConfigured) {
    updatePrestadorLegacy(prestadorId, updates)
    return
  }

  const { error } = await supabase
    .from("prestadores")
    .update(updates)
    .eq("id", prestadorId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function removePrestador(prestadorId) {
  if (!isSupabaseConfigured) {
    removePrestadorLegacy(prestadorId)
    return
  }

  const { error } = await supabase.from("prestadores").delete().eq("id", prestadorId)

  if (error) {
    throw new Error(error.message)
  }
}

