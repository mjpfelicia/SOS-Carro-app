import { isSupabaseConfigured, supabase } from "../lib/supabaseClient"
import { updateUsuario as updateUsuarioLegacy } from "./storage"
import { getCurrentSessionUser } from "./authService"

export async function updateCurrentProfile(data) {
  if (!isSupabaseConfigured) {
    return updateUsuarioLegacy(data)
  }

  const currentProfile = await getCurrentSessionUser()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) {
    throw new Error(userError.message)
  }

  if (!user) {
    throw new Error("Nenhum usuario autenticado")
  }

  if (data.email && data.email !== user.email) {
    const { error: authError } = await supabase.auth.updateUser({
      email: data.email
    })

    if (authError) {
      throw new Error(authError.message)
    }
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      nome: data.nome,
      email: data.email || user.email,
      telefone: data.telefone || "",
      role: data.role || currentProfile?.role || "cliente"
    },
    {
      onConflict: "id"
    }
  )

  if (profileError) {
    throw new Error(profileError.message)
  }

  return getCurrentSessionUser()
}
