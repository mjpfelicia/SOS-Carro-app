import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de iniciar o MCP.")
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

const createPrestadorSchema = z.object({
  nome: z.string().min(1),
  telefone: z.string().min(1),
  tipo: z.string().min(1),
  cidade: z.string().min(1)
})

const getUserProfileSchema = z.object({
  userId: z.string().uuid()
})

const server = new Server(
  {
    name: "sos-carro-supabase-mcp",
    version: "0.1.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "list_tables",
      description: "Lista as tabelas principais da base do SOS Carro.",
      inputSchema: {
        type: "object",
        properties: {}
      }
    },
    {
      name: "list_prestadores",
      description: "Lista os prestadores cadastrados.",
      inputSchema: {
        type: "object",
        properties: {}
      }
    },
    {
      name: "get_user_profile",
      description: "Busca um perfil de usuario por id.",
      inputSchema: {
        type: "object",
        properties: {
          userId: {
            type: "string"
          }
        },
        required: ["userId"]
      }
    },
    {
      name: "create_prestador",
      description: "Cria um novo prestador.",
      inputSchema: {
        type: "object",
        properties: {
          nome: { type: "string" },
          telefone: { type: "string" },
          tipo: { type: "string" },
          cidade: { type: "string" }
        },
        required: ["nome", "telefone", "tipo", "cidade"]
      }
    }
  ]
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params

  switch (name) {
    case "list_tables":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              [
                "profiles",
                "prestadores",
                "favoritos",
                "chamados",
                "avaliacoes",
                "pacotes",
                "assinaturas"
              ],
              null,
              2
            )
          }
        ]
      }

    case "list_prestadores": {
      const { data, error } = await supabase
        .from("prestadores")
        .select("id, nome, telefone, tipo, cidade, created_at")
        .order("created_at", { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2)
          }
        ]
      }
    }

    case "get_user_profile": {
      const { userId } = getUserProfileSchema.parse(args)
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nome, email, telefone, role, created_at")
        .eq("id", userId)
        .maybeSingle()

      if (error) {
        throw new Error(error.message)
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2)
          }
        ]
      }
    }

    case "create_prestador": {
      const payload = createPrestadorSchema.parse(args)
      const { data, error } = await supabase
        .from("prestadores")
        .insert(payload)
        .select("id, nome, telefone, tipo, cidade, created_at")
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2)
          }
        ]
      }
    }

    default:
      throw new Error(`Tool nao suportada: ${name}`)
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
