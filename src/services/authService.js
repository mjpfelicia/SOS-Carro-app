import { isSupabaseConfigured, supabase } from "../lib/supabaseClient"
import {
  autenticarUsuario as autenticarUsuarioLegacy,
  createUsuario as createUsuarioLegacy,
  getUsuarioAtual as getUsuarioAtualLegacy,
  logoutUsuario as logoutUsuarioLegacy,
  setUsuarioAtual as setUsuarioAtualLegacy
} from "./storage"

function mapSupabaseUser(authUser, profile = null) {
  if (!authUser) {
    return null
  }

  const metadata = authUser.user_metadata || {}

  return {
    id: authUser.id,
    nome: profile?.nome || metadata.nome || authUser.email?.split("@")[0] || "Usuario",
    email: profile?.email || authUser.email || "",
    telefone: profile?.telefone || metadata.telefone || "",
    role: profile?.role || metadata.role || "cliente"
  }
}

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nome, email, telefone, role")
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

async function upsertProfile(profile) {
  const { error } = await supabase.from("profiles").upsert(profile, {
    onConflict: "id"
  })

  if (error) {
    throw error
  }
}

export function syncLegacySessionUser(usuario) {
  if (usuario) {
    setUsuarioAtualLegacy(usuario)
    return
  }

  logoutUsuarioLegacy()
}

export async function getCurrentSessionUser() {
  if (!isSupabaseConfigured) {
    return getUsuarioAtualLegacy()
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user) {
    return null
  }

  const profile = await fetchProfile(user.id)
  return mapSupabaseUser(user, profile)
}

export async function signIn({ email, senha }) {
  if (!isSupabaseConfigured) {
    const usuario = autenticarUsuarioLegacy(email, senha)

    if (!usuario) {
      throw new Error("Nao encontramos um usuario com esse email e senha.")
    }

    return usuario
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha
  })

  if (error) {
    throw new Error(error.message)
  }

  return getCurrentSessionUser()
}

export async function signUp({ nome, email, telefone, senha }) {
  if (!isSupabaseConfigured) {
    return createUsuarioLegacy({ nome, email, telefone, senha })
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: {
        nome,
        telefone,
        role: "cliente"
      }
    }
  })

  if (error) {
    throw new Error(error.message)
  }

  if (data.user && data.session) {
    await upsertProfile({
      id: data.user.id,
      nome,
      email,
      telefone,
      role: "cliente"
    })
  }

  return {
    usuario: data.user ? mapSupabaseUser(data.user, { nome, email, telefone, role: "cliente" }) : null,
    requerConfirmacaoEmail: !data.session
  }
}

export async function signOut() {
  if (!isSupabaseConfigured) {
    logoutUsuarioLegacy()
    return
  }

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}
