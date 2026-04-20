import { isSupabaseConfigured, supabase } from "../lib/supabaseClient"
import {
  getFavoritos as getFavoritosLegacy,
  toggleFavorito as toggleFavoritoLegacy
} from "./storage"

async function getAuthenticatedUser() {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error) {
    console.error("Auth error:", error)
    return null
  }

  if (!user) {
    console.warn("No authenticated user found")
    return null
  }

  return user
}

export async function listFavoritosIds() {
  if (!isSupabaseConfigured) {
    return getFavoritosLegacy()
  }

  const user = await getAuthenticatedUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from("favoritos")
    .select("prestador_id")
    .eq("user_id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  return data.map((item) => item.prestador_id)
}

export async function toggleFavorito(prestadorId) {
  if (!isSupabaseConfigured) {
    return toggleFavoritoLegacy(prestadorId)
  }

  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Entre na sua conta para salvar favoritos.")
  }

  const { data: existente, error: findError } = await supabase
    .from("favoritos")
    .select("id")
    .eq("user_id", user.id)
    .eq("prestador_id", prestadorId)
    .maybeSingle()

  if (findError) {
    throw new Error(findError.message)
  }

  if (existente) {
    const { error: deleteError } = await supabase.from("favoritos").delete().eq("id", existente.id)

    if (deleteError) {
      throw new Error(deleteError.message)
    }
  } else {
    const { error: insertError } = await supabase.from("favoritos").insert({
      user_id: user.id,
      prestador_id: prestadorId
    })

    if (insertError) {
      throw new Error(insertError.message)
    }
  }

  return listFavoritosIds()
}

